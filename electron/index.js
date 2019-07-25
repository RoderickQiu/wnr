const { app, BrowserWindow, ipcMain } = require('electron');
const isDevMode = require('electron-is-dev');
const { CapacitorSplashScreen } = require('@capacitor/electron');
const path = require('path');

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null;
// Placeholder for SplashScreen ref
let splashScreen = null;
//Change this if you do not wish to have a splash screen
let useSplashScreen = false;

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
ipcMain.on('fullScreen', function () {
  if (mainWindow)
    mainWindow.setFullScreen(true);
});

ipcMain.on('normalScreen', function () {
  if (mainWindow)
    mainWindow.setFullScreen(false);
});