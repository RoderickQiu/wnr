const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, dialog, shell } = require('electron')
const Store = require('electron-store');
const store = new Store();
const path = require("path");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, settingsWin = null, aboutWin = null
let tray = null, contextMenu = null
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');// 允许自动播放音频

function createWindow() {
    // 创建浏览器窗口。
    win = new BrowserWindow({
        width: 324,
        height: 270,
        frame: false,
        resizable: false,
        show: false,
        hasShadow: true,
        webPreferences: { nodeIntegration: true },
        title: "wnr",
        icon: "./res/icons/wnrIcon.png",
        backgroundColor: "#fefefe"
    });// 为跨平台优化

    // 然后加载应用的 index.html。
    win.loadFile('index.html');

    //在加载页面时，渲染进程第一次完成绘制时，会发出 ready-to-show 事件。在此事件后显示窗口将没有视觉闪烁
    win.once('ready-to-show', () => {
        win.show()
        //win.webContents.openDevTools()
    });

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null;
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
}

// 当程序就要结束
app.on('will-quit', () => {
    // 清空所有快捷键
    globalShortcut.unregisterAll()
})

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', () => {
    createWindow();

    if (store.get("top") == true || store.get("top") == undefined) win.setAlwaysOnTop(true);

    globalShortcut.register('CommandOrControl+Shift+Alt+W', () => {
        win.isVisible() ? win.hide() : win.show();
        if (settingsWin != null) settingsWin.isVisible() ? settingsWin.hide() : settingsWin.show();
        if (aboutWin != null) aboutWin.isVisible() ? aboutWin.hide() : aboutWin.show();
    })

    if (process.platform == "win32") tray = new Tray(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
    else if (process.platform != "darwin") tray = new Tray(path.join(__dirname, '\\res\\icons\\wnrIcon.png'));
    contextMenu = Menu.buildFromTemplate([
        {
            label: 'wnr v' + require("./package.json").version
        }, {
            type: 'separator'
        }, {
            label: 'Start / Stop',
            enabled: false,
            click: function () {
                win.webContents.send('startorstop')
            }
        }, {
            type: 'separator'
        }, {
            label: 'Website',
            click: function () {
                shell.openExternal('https://wnr.scris.top/');
            }
        }, {
            label: 'Help Page',
            click: function () {
                shell.openExternal('https://wnr.scris.top/help.html');
            }
        }, {
            label: 'Github',
            click: function () {
                shell.openExternal('https://github.com/RoderickQiu/wnr/');
            }
        }, {
            type: 'separator'
        }, {
            label: 'Show / Hide', click: () => {
                win.isVisible() ? win.hide() : win.show();
                if (settingsWin != null) settingsWin.isVisible() ? settingsWin.hide() : settingsWin.show();
                if (aboutWin != null) aboutWin.isVisible() ? aboutWin.hide() : aboutWin.show();
            }
        }, {
            label: 'Exit', click: () => { app.quit() }
        }
    ]);
    if (tray != null) {
        tray.setToolTip('wnr');
        tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            win.isVisible() ? win.hide() : win.show();
            if (settingsWin != null) settingsWin.isVisible() ? settingsWin.hide() : settingsWin.show();
            if (aboutWin != null) aboutWin.isVisible() ? aboutWin.hide() : aboutWin.show()
        });//托盘菜单
    }

    if (process.platform === 'darwin') {
        var template = [{
            label: 'wnr',
            submenu: [{
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click: function () {
                    app.quit();
                }
            }]
        }, {
            label: 'Help',
            submenu: [{
                label: 'Website',
                click: function () {
                    shell.openExternal('https://wnr.scris.top/');
                }
            }, {
                label: 'Help Page',
                click: function () {
                    shell.openExternal('https://wnr.scris.top/help.html');
                }
            }, {
                label: 'View it on Github',
                click: function () {
                    shell.openExternal('https://github.com/RoderickQiu/wnr/');
                }
            }]
        }];
        var osxMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(osxMenu)
    }// 应付macOS的顶栏空缺
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('warninggiver-workend', function () {
    if (win != null) {
        win.show();
        win.focus();
        win.center();
        win.once('focus', () => win.flashFrame(false));
        win.flashFrame(true);
        if (store.get("fullscreen") == true) win.setFullScreen(true);
        setTimeout(function () {
            dialog.showMessageBox(win, {
                title: "Your work time is now ended!",
                type: "info",
                message: "Your work time is now ended. Enjoy your rest time!",
                silent: true
            }, function (response) {
                win.webContents.send('warning-closed');
            });
        }, 100)
    }
})

ipcMain.on('warninggiver-restend', function () {
    if (win != null) {
        win.once('focus', () => win.flashFrame(false));
        win.flashFrame(true);
        if (win.isFullScreen()) win.setFullScreen(false);
        setTimeout(function () {
            dialog.showMessageBox(win, {
                title: "Your rest time is now ended!",
                type: "info",
                message: "Your rest time is now ended. Start working!"
            }, function (response) {
                if (!win.isVisible()) win.show();
                win.webContents.send('warning-closed');
            });
        }, 180)
    }
})

ipcMain.on('warninggiver-allend', function () {
    if (win != null) {
        win.once('focus', () => win.flashFrame(false));
        win.flashFrame(true);
        if (win.isFullScreen()) win.setFullScreen(false);
        setTimeout(function () {
            dialog.showMessageBox(win, {
                title: "Your schedule is now finished!",
                type: "info",
                message: "Your schedule is now finished. You can now set another one."
            }, function () {
                if (!win.isVisible()) win.show()
            });
        }, 100)
    }
})

ipcMain.on('updateavailable', function () {
    dialog.showMessageBox(win, {
        title: "New version available!",
        type: "warning",
        message: "A new version of wnr is now available. To enjoy wnr better, you should download and install the update.",
        checkboxLabel: "Go to GitHub and download the new release",
        checkboxChecked: true
    }, function (response, checkboxChecked) {
        if (checkboxChecked) {
            shell.openExternal("https://github.com/RoderickQiu/wnr/releases/latest");
        }

    })
})

ipcMain.on('noupdateavailable', function () {
    dialog.showMessageBox(win, {
        title: "No update available.",
        type: "info",
        message: "No update available. Thanks for using wnr!"
    })
})

ipcMain.on('relauncher', function () {
    app.relaunch();
    app.exit(0)
})

ipcMain.on('winhider', function () {
    win.hide()
})

ipcMain.on('minimizer', function () {
    win.minimize()
})

ipcMain.on('about', function () {
    aboutWin = new BrowserWindow({ parent: win, modal: true, width: 256, height: 233, resizable: false, frame: false, show: false, center: true, webPreferences: { nodeIntegration: true } });
    aboutWin.loadFile("about.html");
    if (store.get("top") == true || store.get("top") == undefined) aboutWin.setAlwaysOnTop(true);
    aboutWin.once('ready-to-show', () => {
        aboutWin.show();
    })
    aboutWin.on('closed', () => {
        aboutWin = null
    })
})

ipcMain.on('settings', function () {
    settingsWin = new BrowserWindow({ parent: win, modal: true, width: 720, height: 540, resizable: false, frame: false, show: false, center: true, webPreferences: { nodeIntegration: true } });
    settingsWin.loadFile("settings.html");
    if (store.get("top") == true || store.get("top") == undefined) settingsWin.setAlwaysOnTop(true);
    settingsWin.once('ready-to-show', () => {
        settingsWin.show();
    })
    settingsWin.on('closed', () => {
        if (win != null) {
            win.reload();
        }
        settingsWin = null
    })
})

ipcMain.on("progress-bar-set", function (event, message) {
    if (win != null) win.setProgressBar(1 - message)
})

ipcMain.on("logger", function (event, message) {
    console.log(message)
})

ipcMain.on("timer-win", function (event, message) {
    if (message) {
        if (tray != null) {
            contextMenu.items[2].enabled = true;
        }
        globalShortcut.register('CommandOrControl+Shift+Alt+S', () => {
            win.webContents.send('startorstop');
        })
    } else {
        if (tray != null) {
            contextMenu.items[2].enabled = false;
        }
        globalShortcut.unregister('CommandOrControl+Shift+Alt+S');
    }
})

/* 参考：
- https://blog.avocode.com/4-must-know-tips-for-building-cross-platform-electron-apps-f3ae9c2bffff [need proxy]
- https://electronjs.org/docs
*/