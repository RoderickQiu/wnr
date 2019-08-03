const { app, shell, Tray, Menu, BrowserWindow, ipcMain, powerSaveBlocker, Notification, dialog } = require('electron');
const isDevMode = require('electron-is-dev');
const { CapacitorSplashScreen } = require('@capacitor/electron');
const path = require('path');

const electronI18NMessages = {
  'en': {
    tooManyInstances: {
      title: "It's not supported to open more than 1 wnr. ",
      notes: "It may cause abnormal behavior when you open more than 1 wnr. "
    },
    macOSApplicationFolder: {
      title: "Move wnr to Applications folder. ",
      notes: "Move to Applications folder can give you better experience using wnr. "
    },
    website: "Website",
    helpPage: "Help Page",
    github: "GitHub",
    showOrHide: "Show / Hide",
    exit: "Exit wnr",
    doThings: "Help & About"
  },
  'zh-CN': {
    tooManyInstances: {
      title: "我们不推荐同时运行超过1个wnr。",
      notes: "运行超过1个wnr程序是不被支持的，可能触发应用故障。"
    },
    macOSApplicationFolder: {
      title: "请把wnr移入“应用程序”文件夹。",
      notes: "把wnr移入“应用程序”，你将可以获得更好的用户体验。"
    },
    website: "官方网站",
    helpPage: "帮助手册",
    github: "GitHub",
    showOrHide: "显示/隐藏",
    exit: "退出wnr",
    doThings: "帮助与关于"
  }
}

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null;
// Placeholder for SplashScreen ref
let splashScreen = null;
//Change this if you do not wish to have a splash screen
let useSplashScreen = false;
//The tray / menu of wnr, system specific
let theTray = null, osxMenu = null, windowsMenu = null;
//The language of wnr
let langCode = null;

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')// allow auto sound notifying

powerSaveBlocker.start('prevent-app-suspension')//prevent system from suspension

async function createWindow() {
  // Define our main window size
  mainWindow = new BrowserWindow({
    "width": 352,
    "height": 588,
    frame: false,
    resizable: false,
    maximizable: false,
    show: false,
    hasShadow: true,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'node_modules', '@capacitor', 'electron', 'dist', 'electron-bridge.js')
    }
  });

  if (isDevMode) {
    // If we are developers we might as well open the devtools by default.
    mainWindow.webContents.openDevTools();
  }

  if (useSplashScreen) {
    splashScreen = new CapacitorSplashScreen(mainWindow);
    splashScreen.init(false);
  } else {
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.show();
    });
  }

  if (process.platform === 'win32') {
    app.setAppUserModelId("com.scrisstudio.wnr");
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();

  langCode = app.getLocale();
  if (langCode[0] == 'z' && langCode[1] == 'h') langCode = 'zh-CN';
  else langCode = 'en';

  mainWindow.webContents.send('tooManyInstances');
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock && mainWindow != null) {
    notificationMessenger("tooManyInstances");
  }//tip for not recommend more than 1 wnr running

  if (process.platform == "darmainWindow") {
    if (!app.isInApplicationsFolder()) {
      notificationMessenger("macOSApplicationFolder");
    }
  }//tip for macOS application folder usage

  getTray();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Define any IPC or other custom functionality below here
ipcMain.on('full-screen', function () {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.center();
    mainWindow.setAlwaysOnTop(true);
    setTimeout(function () { mainWindow.setFullScreen(true) }, 500);
  }
});

ipcMain.on('normal-screen', function () {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setFullScreen(false);
  }
});

ipcMain.on("progress-bar-set", function (event, message) {
  if (mainWindow != null) mainWindow.setProgressBar(1 - message)
})

ipcMain.on('minimize', function () {
  if (mainWindow)
    mainWindow.minimize();
});

ipcMain.on('hide', function () {
  if (mainWindow)
    mainWindow.hide();
});

function i18nGet(item) {
  return electronI18NMessages[langCode][item];
}

function notificationMessenger(item) {
  let theMessage = i18nGet(item);
  if (Notification.isSupported()) {
    let notification = new Notification({
      title: theMessage.title,
      body: theMessage.notes,
      silent: false
    });
    notification.show();
  } else {
    dialog.showMessageBox({
      type: "warning",
      title: theMessage.title,
      message: theMessage.notes,
      icon: path.join(__dirname, '\\res\\icons\\wnrIcon.png')
    });
  }
}

function getTray() {
  if (process.platform == "win32") {
    theTray = new Tray(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
    windowsMenu = Menu.buildFromTemplate([
      {
        label: 'wnr'
      }, {
        type: 'separator'
      }, {
        label: i18nGet('website'),
        click: function () {
          shell.openExternal('https://wnr.scris.top/');
        }
      }, {
        label: i18nGet('helpPage'),
        click: function () {
          shell.openExternal('https://wnr.scris.top/help.html');
        }
      }, {
        label: i18nGet('github'),
        click: function () {
          shell.openExternal('https://github.com/RoderickQiu/wnr/');
        }
      }, {
        type: 'separator'
      }, {
        label: i18nGet('showOrHide'), click: () => {
          if (mainWindow != null) mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        }
      }, {
        label: i18nGet('exit'), click: () => { app.quit() }
      }
    ]);
    if (theTray != null) {
      theTray.setToolTip('wnr');
      theTray.setContextMenu(windowsMenu);
      theTray.on('click', () => {
        if (mainWindow != null) mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      });
    }
  } else if (process.platform == "darwin") {
    var template = [{
      label: 'wnr',
      submenu: [{
        label: i18nGet('exit'),
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
          app.quit();
        }
      }]
    }, {
      label: i18n.__('doThings'),
      submenu: [{
        label: i18n.__('website'),
        click: function () {
          shell.openExternal('https://wnr.scris.top/');
        }
      }, {
        label: i18n.__('helpPage'),
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
    osxMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(osxMenu);
  }
}//Tray / Menu support