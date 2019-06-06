const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, dialog, shell, powerSaveBlocker } = require('electron')
const Store = require('electron-store');
const store = new Store();
const path = require("path");
const notifier = require('node-notifier');
var i18n = require("i18n")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, settingsWin = null, aboutWin = null, tourWin = null;
let tray = null, contextMenu = null
let resetAlarm = null

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')// 允许自动播放音频

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit()// 只允许同时运行一个wnr

powerSaveBlocker.start('prevent-app-suspension')//防止app被挂起，停止计时

function createWindow() {
    // 创建浏览器窗口。
    win = new BrowserWindow({
        width: 342,
        height: 336,
        frame: false,
        resizable: false,
        show: false,
        hasShadow: true,
        webPreferences: { nodeIntegration: true },
        titleBarStyle: "hiddenInset",
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

function alarmSet() {
    if (!resetAlarm) {
        resetAlarm = setInterval(function () {
            if (win != null) win.flashFrame(true);
            notifier.notify(
                {
                    title: i18n.__('alarmtip'),
                    message: i18n.__('alarmtipmsg'),
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification
                }
            );
            if (!win.isVisible()) win.show();
        }, 1200000)//不断提示使用wnr
    }
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

    i18n.configure({
        locales: ['en', 'zh'],
        directory: __dirname + '/locales',
        register: global
    });
    if (store.get("i18n") == undefined) {
        var lang = app.getLocale();
        if (lang[0] == 'e' && lang[1] == 'n') {
            lang = 'en';
        }
        if (lang[0] == 'z' && lang[1] == 'h') {
            lang = 'zh';
        }//自动去掉不必要的语言尾巴
        store.set('i18n', lang);
    }
    i18n.setLocale(store.get("i18n"));//国际化组件默认设置

    if (store.get("top") == true) win.setAlwaysOnTop(true);

    if (!store.get('hotkey1')) store.set('hotkey1', 'W');
    if (!store.get('hotkey2')) store.set('hotkey2', 'S');

    globalShortcut.register('CommandOrControl+Shift+Alt+' + store.get('hotkey1'), () => {
        win.isVisible() ? win.hide() : win.show();
        if (settingsWin != null) settingsWin.isVisible() ? settingsWin.hide() : settingsWin.show();
        if (aboutWin != null) aboutWin.isVisible() ? aboutWin.hide() : aboutWin.show();
        if (tourWin != null) tourWin.isVisible() ? tourWin.hide() : tourWin.show();
    })

    if (process.platform == "win32") tray = new Tray(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
    else if (process.platform != "darwin") tray = new Tray(path.join(__dirname, '\\res\\icons\\wnrIcon.png'));
    contextMenu = Menu.buildFromTemplate([
        {
            label: 'wnr' + i18n.__('v') + require("./package.json").version
        }, {
            type: 'separator'
        }, {
            label: i18n.__('startorstop'),
            enabled: false,
            click: function () {
                win.webContents.send('startorstop')
            }
        }, {
            type: 'separator'
        }, {
            label: i18n.__('website'),
            click: function () {
                shell.openExternal('https://wnr.scris.top/');
            }
        }, {
            label: i18n.__('helppage'),
            click: function () {
                shell.openExternal('https://wnr.scris.top/help.html');
            }
        }, {
            label: i18n.__('github'),
            click: function () {
                shell.openExternal('https://github.com/RoderickQiu/wnr/');
            }
        }, {
            type: 'separator'
        }, {
            label: i18n.__('showorhide'), click: () => {
                win.isVisible() ? win.hide() : win.show();
                if (settingsWin != null) settingsWin.isVisible() ? settingsWin.hide() : settingsWin.show();
                if (aboutWin != null) aboutWin.isVisible() ? aboutWin.hide() : aboutWin.show();
                if (tourWin != null) tourWin.isVisible() ? tourWin.hide() : tourWin.show();
            }
        }, {
            label: i18n.__('exit'), click: () => { app.quit() }
        }
    ]);
    if (tray != null) {
        tray.setToolTip('wnr');
        tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            win.isVisible() ? win.hide() : win.show();
            if (settingsWin != null) settingsWin.isVisible() ? settingsWin.hide() : settingsWin.show();
            if (aboutWin != null) aboutWin.isVisible() ? aboutWin.hide() : aboutWin.show();
            if (tourWin != null) tourWin.isVisible() ? tourWin.hide() : tourWin.show()
        });//托盘菜单
    }

    if (process.platform === 'darwin') {
        var template = [{
            label: 'wnr',
            submenu: [{
                label: i18n.__('quit'),
                accelerator: 'CmdOrCtrl+Q',
                click: function () {
                    app.quit();
                }
            }]
        }, {
            label: i18n.__('dothings'),
            submenu: [{
                label: i18n.__('settings'),
                click: function () {
                    settings();
                }
            }, {
                label: i18n.__('tourguide'),
                click: function () {
                    tourguide();
                }
            }, {
                label: i18n.__('about'),
                click: function () {
                    about();
                }
            }, {
                type: 'separator'
            }, {
                label: i18n.__('website'),
                click: function () {
                    shell.openExternal('https://wnr.scris.top/');
                }
            }, {
                label: i18n.__('helppage'),
                click: function () {
                    shell.openExternal('https://wnr.scris.top/help.html');
                }
            }, {
                label: i18n.__('github'),
                click: function () {
                    shell.openExternal('https://github.com/RoderickQiu/wnr/');
                }
            }]
        }];
        var osxMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(osxMenu);
        app.dock.setMenu(osxMenu)
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
        win.flashFrame(true);
        if (store.get("fullscreen") == true) {
            if (store.get("top") != true) win.setAlwaysOnTop(true);//全屏时恒定最上层
            win.setFullScreen(true);
        }
        setTimeout(function () {
            dialog.showMessageBox(win, {
                title: i18n.__('worktimeend'),
                type: "warning",
                message: i18n.__('worktimeend'),
            }, function (response) {
                win.webContents.send('warning-closed');
            })
        }, 100)
    }
})

ipcMain.on('warninggiver-restend', function () {
    if (win != null) {
        if (!win.isVisible()) win.show();
        win.flashFrame(true);
        if (store.get("fullscreen") == true) {
            if (store.get("top") != true) win.setAlwaysOnTop(false);//取消不需要的恒定最上层
            win.setFullScreen(false);
        }
        setTimeout(function () {
            dialog.showMessageBox(win, {
                title: i18n.__('resttimeend'),
                type: "warning",
                message: i18n.__('resttimemsg'),
            }, function (response) {
                win.webContents.send('warning-closed');
            })
        }, 180)
    }
})

ipcMain.on('warninggiver-allend', function () {
    if (win != null) {
        if (!win.isVisible()) win.show();
        win.flashFrame(true);
        if (store.get("fullscreen") == true) {
            if (store.get("top") != true) win.setAlwaysOnTop(false);//取消不需要的恒定最上层
            win.setFullScreen(false);
        }
        setTimeout(function () {
            dialog.showMessageBox(win, {
                title: i18n.__('allend'),
                type: "warning",
                message: i18n.__('allmsg'),
            }, function (response) {
                win.loadFile('index.html');//回到首页，方便开始新计划
            })
        }, 100)
        alarmSet();
    }
})

ipcMain.on('updateavailable', function () {
    dialog.showMessageBox(settingsWin, {
        title: i18n.__('update'),
        type: "warning",
        message: i18n.__('updatemsg'),
        checkboxLabel: i18n.__('updatechk'),
        checkboxChecked: true
    }, function (response, checkboxChecked) {
        if (checkboxChecked) {
            shell.openExternal("https://github.com/RoderickQiu/wnr/releases/latest");
        }
    })
})

ipcMain.on('noupdateavailable', function () {
    dialog.showMessageBox(settingsWin, {
        title: i18n.__('noupdate'),
        type: "info",
        message: i18n.__('noupdatemsg')
    })
})

ipcMain.on('webproblem', function () {
    dialog.showMessageBox(settingsWin, {
        title: i18n.__('webproblem'),
        type: "info",
        message: i18n.__('webproblemmsg')
    })
})

ipcMain.on('deleteall', function () {
    dialog.showMessageBox(settingsWin, {
        title: i18n.__('deletealltitle'),
        type: "warning",
        message: i18n.__('deleteallcontent'),
        checkboxLabel: i18n.__('deleteallchk'),
        checkboxChecked: false
    }, function (response, checkboxChecked) {
        if (checkboxChecked) {
            store.clear();
            app.relaunch();
            app.exit(0)
        }
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

function about() {
    if (app.isReady()) {
        aboutWin = new BrowserWindow({ parent: win, width: 256, height: 233, resizable: false, frame: false, show: false, center: true, titleBarStyle: "hidden", webPreferences: { nodeIntegration: true } });
        aboutWin.loadFile("about.html");
        if (store.get("top") == true) aboutWin.setAlwaysOnTop(true);
        aboutWin.once('ready-to-show', () => {
            aboutWin.show();
        })
        aboutWin.on('closed', () => {
            aboutWin = null
        })
    }
}
ipcMain.on('about', about);

function settings() {
    if (app.isReady()) {
        settingsWin = new BrowserWindow({ parent: win, width: 729, height: 486, resizable: false, frame: false, show: false, center: true, webPreferences: { nodeIntegration: true }, titleBarStyle: "hidden" });
        settingsWin.loadFile("settings.html");
        if (store.get("top") == true) settingsWin.setAlwaysOnTop(true);
        settingsWin.once('ready-to-show', () => {
            settingsWin.show();
        })
        settingsWin.on('closed', () => {
            if (win != null) {
                win.reload();
            }
            settingsWin = null
        })
        if (!store.get("settings-experience")) {
            store.set("settings-experience", true);
            notifier.notify(
                {
                    title: i18n.__('settingstip'),
                    message: i18n.__('settingstipmsg'),
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification
                }
            );
        }
    }
}
ipcMain.on('settings', settings);

function tourguide() {
    if (app.isReady()) {
        tourWin = new BrowserWindow({ parent: win, width: 729, height: 600, resizable: false, frame: false, show: false, center: true, titleBarStyle: "hidden", webPreferences: { nodeIntegration: true } });
        tourWin.loadFile("tourguide.html");
        if (store.get("top") == true) tourWin.setAlwaysOnTop(true);
        tourWin.once('ready-to-show', () => {
            tourWin.show();
        })
        tourWin.on('closed', () => {
            tourWin = null
        })
        notifier.notify(
            {
                title: i18n.__('welcomer1'),
                message: i18n.__('alarmtipmsg'),
                sound: true, // Only Notification Center or Windows Toasters
                wait: true // Wait with callback, until user action is taken against notification
            }
        );
    }
}
ipcMain.on('tourguide', tourguide);

ipcMain.on('1min', function () {
    notifier.notify(
        {
            title: i18n.__('1min'),
            message: i18n.__('1minmsg'),
            sound: true, // Only Notification Center or Windows Toasters
            wait: true // Wait with callback, until user action is taken against notification
        }
    );
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
        globalShortcut.register('CommandOrControl+Shift+Alt+' + store.get('hotkey2'), () => {
            win.webContents.send('startorstop');
        })
        if (resetAlarm) {
            clearTimeout(resetAlarm);
        }
    } else {
        if (tray != null) {
            contextMenu.items[2].enabled = false;
        }
        globalShortcut.unregister('CommandOrControl+Shift+Alt+' + store.get('hotkey2'));
        alarmSet();
    }
})