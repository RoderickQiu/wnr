const {
    app, BrowserWindow, ipcMain, Tray, Menu,
    globalShortcut, dialog, shell, powerSaveBlocker,
    powerMonitor, nativeTheme, screen, TouchBar, Notification
}
    = require('electron');
const Store = require('electron-store');
const path = require("path");
let i18n = require("i18n");
let cmdOrCtrl = require('cmd-or-ctrl');
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;
const notifier = require('node-notifier')
const fetch = require('node-fetch');
const winReleaseId = require('win-release-id');

//keep a global reference of the objects, or the window will be closed automatically when the garbage collecting.
let win = null, settingsWin = null, aboutWin = null, tourWin = null, floatingWin = null, externalTitleWin = null,
    tray = null, contextMenu = null, settingsWinContextMenu = null,
    resetAlarm = null, powerSaveBlockerId = null, sleepBlockerId = null,
    isTimerWin = null, isWorkMode = null, isChinese = null, isFocused = true,
    isOnlyRest = false, isPositiveTiming = false,
    timeLeftTip = null, trayTimeMsg = null, predefinedTasks = null,
    trayH = null, trayMin = null,
    workTimeFocused = false, restTimeFocused = false,
    fullScreenProtection = false,
    progress = -1, timeLeftOnBar = null,
    dockHide = false,
    newWindows = [], displays = null, hasMultiDisplays = null,
    isLoose = false, isForceScreenLock = false, isScreenLocked = false,
    isAlarmDialogClosed = true, isShadowless = false, isAlarmTipOn = false,
    hasFloating = false, hasExternalTitle = false, hasGotSingleInstanceLock = false,
    kioskInterval = null,
    recorderDate = null, tempDate = null, yearAndMon = null, yearMonDay = null, year = null,
    store = null, styleCache = null, statistics = null, timingData = null,
    personalizationNotificationList = [[], [], [], [], [], []];

let months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
let languageCodeList = ['en', 'zh-CN', 'zh-TW'], i//locale code
let ratioList = [0.75, 0.9, 1, 1.1, 1.25], ratio = 1;//zoom ratio
let notificationNamesList = ['work-time-end', 'work-time-end-msg', 'rest-time-end', 'rest-time-end-msg', 'all-task-end', 'all-task-end-msg'];

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')//to play sounds

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';//prevent seeing this meaningless alert

//use native notification, declare package.json/build/appId beforehand
app.on('ready', () => app.setAppUserModelId('com.scrisstudio.wnr'));

function createWindow() {
    //create the main window
    win = new BrowserWindow({
        width: 360,
        height: 459,
        minWidth: 349,
        minHeight: 444,
        frame: false,
        backgroundColor: "#fefefe",
        resizable: true,
        maximizable: false,
        show: false,
        hasShadow: true,
        webPreferences: {
            nodeIntegration: true,
            webgl: false,
            contextIsolation: false,
            enableRemoteModule: true,
            spellcheck: false
        },
        titleBarStyle: "hiddenInset",
        icon: "./res/icons/wnrIcon.png"
    });//optimize for cross-platform

    //load index.html
    win.loadFile('index.html');

    //to load without sparking
    win.once('ready-to-show', () => {
        win.show();
        win.moveTop();
    });

    //triggers when the main windows is closed
    win.on('closed', () => {
        win = null;
        settingsWin = null;
        tourWin = null;
        aboutWin = null;
    });

    win.on('session-end', () => {
        app.exit(0);
    });

    win.on('blur', () => {
        isFocused = false;
    });

    win.on('focus', () => {
        isFocused = true;
    });

    //triggers for macos lock
    win.on('close', (event) => {
        if (hasGotSingleInstanceLock)
            if (((store.get("islocked") || (fullScreenProtection && isTimerWin)) && (process.env.NODE_ENV !== "development"))) {
                event.preventDefault();
                if (win != null)
                    notificationSolution("wnr", i18n.__('prevent-stop'), "non-important");
            } else if ((process.platform === "darwin")) {
                event.preventDefault();
                windowCloseChk()
            }
    });

    win.on('show', () => {
        if (isTimerWin) {
            if (win != null) {
                win.setProgressBar(progress);
            }
        }
    });

    //prevent app-killers for lock mode / focus mode
    win.webContents.on('crashed', () => {
        if (store.get('islocked') || (fullScreenProtection && isTimerWin && (process.env.NODE_ENV !== "development") && (!isLoose))) relaunchSolution();
    });

    screen.on('display-added', (event, newDisplay) => {
        displays = screen.getAllDisplays();
        hasMultiDisplays = true;
        setTimeout(function () {
            if (fullScreenProtection && isTimerWin && (!isLoose)) {
                for (i in displays) {
                    if (displays[i].id === newDisplay.id) {
                        addScreenSolution(i, newDisplay);
                    }
                }
            }
        }, 500);
    });

    screen.on('display-removed', () => {
        multiScreenSolution("off");
        if (fullScreenProtection && isTimerWin && (!isLoose)) {
            setTimeout(function () {
                multiScreenSolution("on");
            }, 1500);
        }
    });
}

function alarmSet() {
    resetAlarm = setTimeout(function () {
        if (store.get('alarmtip') !== false && isAlarmDialogClosed && isAlarmTipOn) {
            if (win != null) {
                win.flashFrame(true);
                win.show();
                app.focus();
                isAlarmDialogClosed = false;
            }
            dialog.showMessageBox(win, {
                title: " wnr",
                type: "warning",
                message: i18n.__('alarm-for-not-using-wnr-dialog-box-title'),
                detail: i18n.__('alarm-for-not-using-wnr-dialog-box-content'),
                buttons: (process.platform !== "darwin") ? [i18n.__('cancel'), i18n.__('ok')] : [i18n.__('ok'), i18n.__('cancel')],
                cancelId: (process.platform !== "darwin") ? 0 : 1, //buttons map different from darwin to other OSs
                noLink: true
            }).then(function (response) {
                isAlarmDialogClosed = true;
                if (response.response !== ((process.platform !== "darwin") ? 1 : 0)) {
                    win.show();
                    win.moveTop();
                }
                alarmSet();
            });
        }
    }, 600000)//alarm you for using wnr
}

function relaunchSolution() {
    fullScreenProtection = false;
    if (win != null) {
        win.setKiosk(false);
        win.hide();
    }

    app.relaunch();
    app.exit();
}

function setFullScreenMode(flag) {
    if (win != null) {
        if (!isLoose) {
            win.setKiosk(flag);
            if (flag) {
                kioskInterval = setInterval(function () {
                    if (fullScreenProtection && win != null) {
                        forceScreenLockSolution();
                        win.show();
                        win.moveTop();
                        win.setKiosk(true);
                    }
                }, 5000);
            } else clearInterval(kioskInterval);
        } else win.setFullScreen(flag);

        //when fullscreen, prevent sleep
        if (sleepBlockerId) {
            if (!powerSaveBlocker.isStarted(sleepBlockerId))
                sleepBlockerId = powerSaveBlocker.start('prevent-display-sleep');
        } else sleepBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    }
}

function addScreenSolution(windowNumber, display) {
    newWindows[windowNumber] = new BrowserWindow({
        width: 364,
        height: 396,
        x: display.bounds.x,
        y: display.bounds.y,
        frame: false,
        backgroundColor: isDarkMode() ? "#191919" : "#fefefe",
        show: true,
        hasShadow: true,
        webPreferences: {
            nodeIntegration: true,
            webgl: false,
            contextIsolation: false,
            enableRemoteModule: true,
            spellcheck: false
        },
        titleBarStyle: "hiddenInset",
        icon: "./res/icons/wnrIcon.png",
        skipTaskbar: true
    });//optimize for cross platfrom

    newWindows[windowNumber].loadFile('placeholder.html');

    if (process.env.NODE_ENV !== "development") newWindows[windowNumber].setFocusable(false);
    newWindows[windowNumber].setFullScreen(true);
    newWindows[windowNumber].moveTop();
    newWindows[windowNumber].setAlwaysOnTop(true, "floating");
}

function multiScreenSolution(mode) {
    if (app.isReady()) {
        displays = screen.getAllDisplays();
        hasMultiDisplays = (displays.length > 1);
        let winBounds = win.getBounds();
        //get the screen that contains the window
        let distScreen = screen.getDisplayNearestPoint({ x: winBounds.x, y: winBounds.y });
        for (i in displays) {
            if (displays[i].id !== distScreen.id) {
                if (mode === "on") {
                    addScreenSolution(i, displays[i]);
                } else {
                    if (newWindows[i] != null) {
                        try {
                            newWindows[i].destroy();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
        }
    }
}

function touchBarSolution(mode) {
    if (app.isReady()) {
        if (process.platform === "darwin") {
            try {
                if (mode === "index") {
                    let settingsSubmitter = new TouchBarButton({
                        label: i18n.__('settings'),
                        click: () => settings("normal")
                    });
                    let helperSubmitter = new TouchBarButton({
                        label: i18n.__('website'),
                        click: () => shell.openExternal('https://getwnr.com/')
                    });
                    let submitter = new TouchBarButton({
                        label: i18n.__('submitter'),
                        backgroundColor: '#5490ea',
                        click: () => win.webContents.send("submitter")
                    });
                    let touchBar = new TouchBar({
                        items: [
                            settingsSubmitter,
                            new TouchBarSpacer({ size: "small" }),
                            helperSubmitter,
                            new TouchBarSpacer({ size: "small" }),
                            submitter,
                        ]
                    });
                    if (win != null) win.setTouchBar(touchBar);
                } else if (mode === "timer") {
                    let startOrStopSubmitter = new TouchBarButton({
                        label: i18n.__('start-or-stop'),
                        click: () => win.webContents.send("start-or-stop")
                    });
                    timeLeftOnBar = new TouchBarLabel({
                        label: (1 - progress) * 100 + timeLeftTip
                    })
                    let touchBar = new TouchBar({
                        items: [
                            timeLeftOnBar
                        ]
                    });
                    touchBar.escapeItem = startOrStopSubmitter;
                    if (win != null) win.setTouchBar(touchBar);
                }
            } catch (e) {
                console.log(e)
            }
        }
    }
}

//before quit
app.on('will-quit', () => {
    store.set("just-back", false);
    globalShortcut.unregisterAll();
    if (tray != null) {
        tray.destroy();
        tray = null
    }
    if (floatingWin != null) {
        floatingWin.close();
    }
})

//when created the app, triggers
//some apis can be only used inside ready
app.on('ready', () => {
    require('@electron/remote/main').initialize();

    createWindow();
    require("@electron/remote/main").enable(win.webContents);

    if (process.env.NODE_ENV === "portable") {
        store = new Store({ cwd: app.getPath('exe').replace("wnr.exe", ""), name: 'wnr-config' });//accept portable
        statistics = new Store({ cwd: app.getPath('exe').replace("wnr.exe", ""), name: 'wnr-statistics' });
    } else {
        store = new Store();
        statistics = new Store({ name: 'statistics' });
    }
    styleCache = new Store({ name: 'style-cache' });
    timingData = new Store({ name: 'timing-data' });

    if (process.env.NODE_ENV === "development") {
        const debug = require('electron-debug');
        debug({ showDevTools: false });
    }

    i18n.configure({
        locales: languageCodeList,
        directory: __dirname + '/locales',
        register: global,
        missingKeyFn(locale, value) {
            console.warn(`missing translation of "${ value }" in [${ locale }]!`)
            return `${ value }-[${ locale }]`;
        }
    });
    if (store.get("i18n") === undefined) {
        let lang = app.getLocale();
        if (lang.indexOf("zh") !== -1) {
            if ((lang.charAt(3) === 'T' && lang.charAt(4) === 'W') && (lang.charAt(3) === 'H' && lang.charAt(4) === 'K')) lang = 'zh-TW';
            else lang = 'zh-CN';
            isChinese = true;
        } else {
            for (i in languageCodeList) {
                if (lang.indexOf(languageCodeList[i]) !== -1) {
                    lang = languageCodeList[i];
                    break;
                }
            }
            isChinese = false;
        }
        store.set('i18n', lang);
    } else {
        isChinese = store.get("i18n").indexOf("zh") !== -1;
        if (store.get("i18n") === 'zh') {
            let lang = app.getLocale();
            if ((lang.charAt(3) === 'T' && lang.charAt(4) === 'W') && (lang.charAt(3) === 'H' && lang.charAt(4) === 'K')) lang = 'zh-TW';
            else lang = 'zh-CN';
            store.set('i18n', lang);
        }
    }
    i18n.setLocale(store.get("i18n"));//set the locale

    timeLeftTip = i18n.__("time-left");//this will be used in this file frequently

    hasGotSingleInstanceLock = app.requestSingleInstanceLock();
    if (!hasGotSingleInstanceLock) {
        console.log('Didn\'t get the lock, quitting');
        app.quit();
    } else {
        app.on('second-instance', () => {
            if (win != null) {
                if (win.isMinimized()) win.restore();
                if (!win.isVisible()) win.show();
                win.focus();
            }
        });
    }//prevent wnr from running more than one instance

    if (win != null) {
        if (styleCache.has("win-size")) {
            win.setSize(styleCache.get("win-size").width, styleCache.get("win-size").height);
        }
        win.on('resized', () => {
            styleCache.set("win-size", { "width": win.getSize()[0], "height": win.getSize()[1] });
        });
    }

    hasMultiDisplays = screen.getAllDisplays().length > 1;

    if (process.platform === "win32") {
        if (winReleaseId() === -1 && win != null) {
            let isNotified = store.has("windows-7-notification");
            if (isNotified === false) {
                dialog.showMessageBox(win, {
                    title: " wnr",
                    message: i18n.__('old-windows-compatibility-notification'),
                    type: "warning",
                    detail: i18n.__('old-windows-compatibility-notification-msg'),
                }).then(function () {
                    store.set("windows-7-notification", 1);
                });
            }
        }
    }

    if (store.get("dock-hide") && process.platform === "darwin") dockHide = true;

    if (store.get("loose-mode")) isLoose = true;
    if (store.get("force-screen-lock-mode")) isForceScreenLock = true;

    if (win != null) {
        if (store.get("top") === true) win.setAlwaysOnTop(true, "floating");
        else win.setAlwaysOnTop(false);
    }

    store.set("version", require("./package.json").version);

    statisticsInitializer();

    hotkeyInit();

    if (store.has("zoom-ratio"))
        ratio = ratioList[store.get("zoom-ratio")];

    //initializers and compatibility database solutions
    switch (store.get("dark-or-white")) {
        case "auto-switch":
            store.set("dark-or-white", 0);
            break;
        case "dark":
            store.set("dark-or-white", 2);
            break;
        case "light":
            store.set("dark-or-white", 1);
            break;
    }

    if (store.get('islocked') && win != null) {//locked mode
        win.closable = false;
    }

    if (store.has("default-page")) {
        if (typeof store.get("default-page") === "string")
            store.set("default-page", Number(store.get("default-page")) - 1);
    }

    if (store.has("nap-time")) {
        let napTime = store.get("nap-time"),
            nap = store.get("nap");
        if (napTime <= 10) {
            store.set("nap-time", 10);
            store.set("nap-in-timing", nap ? 1 : 0);
        } else if (napTime > 10 && napTime <= 15) {
            store.set("nap-time", 15);
            store.set("nap-in-timing", nap ? 2 : 0);
        } else if (napTime > 15) {
            store.set("nap-time", 20);
            store.set("nap-in-timing", nap ? 3 : 0);
        }
    }

    if (!store.has("reserved-record")) store.set("reserved-record", 0);
    if (!store.has("reserved-cnt")) store.set("reserved-cnt", 0);//reserved tasks init

    if (!store.has("disable-pausing-special")) store.set("disable-pausing-special", "all");
    else {
        let d = store.get("disable-pausing"),
            ds = store.get("disable-pausing-special");
        if (!d) store.set("disable-pause", 3);
        else if (ds === "all") store.set("disable-pause", 0);
        else if (ds === "work") store.set("disable-pause", 1);
        else store.set("disable-pause", 2);
    }
    if (!store.has("disable-skipping-special")) store.set("disable-skipping-special", "all");
    else {
        let d = store.get("disable-skipping"),
            ds = store.get("disable-skipping-special");
        if (!d) store.set("disable-skip", 3);
        else if (ds === "all") store.set("disable-skip", 0);
        else if (ds === "work") store.set("disable-skip", 1);
        else store.set("disable-skip", 2);
    }
    if (!store.has("disable-backing-special")) store.set("disable-backing-special", "all");
    else {
        let d = store.get("disable-backing"),
            ds = store.get("disable-backing-special");
        if (!d) store.set("disable-back", 3);
        else if (ds === "all") store.set("disable-back", 0);
        else if (ds === "work") store.set("disable-back", 1);
        else store.set("disable-back", 2);
    }

    if (store.has("no-check-time-end")) {
        store.set("no-check-work-time-end", store.get("no-check-time-end"));
        store.set("no-check-rest-time-end", store.get("no-check-time-end"));
        store.delete("no-check-time-end");
    }

    if (store.has("should-stop-locked"))
        store.set("timing-after-locked", store.get("should-stop-locked"));

    if (store.has("no-check-work-time-end") && store.get("when-work-time-end") !== 2) {
        if (store.get("no-check-work-time-end"))
            store.set("when-work-time-end", 1);
        else store.set("when-work-time-end", 0);
    }
    if (store.has("no-check-rest-time-end") && store.get("when-rest-time-end") !== 2) {
        if (store.get("no-check-rest-time-end"))
            store.set("when-work-time-end", 1);
        else store.set("when-work-time-end", 0);
    }

    if (store.has("sound")) {
        if (store.get("sound") === true) store.set("sound", 4);
        else if (store.get("sound") === false) store.set("sound", 0);
    } else store.set("sound", 4);

    store.set("just-launched", true);

    if (store.has("personalization-notification")) {
        let tempString = "", tempInt = 0;
        for (i in notificationNamesList) {
            tempInt = 0;
            if (store.has("personalization-notification." + notificationNamesList[i])) {
                tempString = store.get("personalization-notification." + notificationNamesList[i]);
                for (let j = 0; j < tempString.length - 1; j++) {
                    if (tempString[j] === "/" && tempString[j + 1] === "/") {
                        personalizationNotificationList[i].push(tempString.slice(tempInt, j));
                        tempInt = j + 2;
                    }
                }
                personalizationNotificationList[i].push(tempString.slice(tempInt, tempString.length));
            }
        }
    }

    if (process.platform === "darwin" && process.env.NODE_ENV !== "development") {
        if (!app.isInApplicationsFolder()) {
            notificationSolution(i18n.__('wrong-folder-notification-title'), i18n.__('wrong-folder-notification-content'), "normal");
        }
    }

    nativeTheme.on('updated', function theThemeHasChanged() {
        if (!store.has("dark-or-white")) {
            if (nativeTheme.shouldUseDarkColors) {
                styleCache.set('isdark', true);
                if (win != null) {
                    win.setBackgroundColor('#191919');
                    win.webContents.send('darkModeChanges');
                }
            } else {
                styleCache.set('isdark', false);
                if (win != null) {
                    win.setBackgroundColor('#fefefe');
                    win.webContents.send('darkModeChanges');
                }
            }
        }
    });

    if (process.platform === "win32") tray = new Tray(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
    else if (process.platform === "darwin") tray = new Tray(path.join(__dirname, '/res/icons/trayIconMacTemplate.png'));
    else if (process.platform === "linux") tray = new Tray(path.join(__dirname, '/res/icons/wnrIcon.png'));
    try {
        tray.setToolTip('wnr');
    } catch (e) {
        console.log(e);
    }
    traySolution(false);
    macOSFullscreenSolution(false);
    isDarkMode();
    settingsWinContextMenuSolution();

    if (store.get("tray-time") !== false && process.platform === "darwin")
        tray.setTitle(' ' + i18n.__('not-timing-tray'));

    if (!store.has("predefined-tasks-created")) {
        store.set("predefined-tasks-created", true);

        predefinedTasks = [{
            name: i18n.__('predefined-task-wnr-recommended'),
            workTime: 30,
            restTime: 6,
            loops: 5,
            focusWhenWorking: false,
            focusWhenResting: true
        }, {
            name: i18n.__('predefined-task-pomodoro'),
            workTime: 25,
            restTime: 5,
            loops: 4,
            focusWhenWorking: false,
            focusWhenResting: true
        }, {
            name: i18n.__('predefined-task-class-time'),
            workTime: 40,
            restTime: 10,
            loops: 1,
            focusWhenWorking: true,
            focusWhenResting: false
        }];
        store.set("predefined-tasks", predefinedTasks);
        store.set("default-task", -1);//-1: not set yet
    } else predefinedTasks = store.get("predefined-tasks", predefinedTasks);//init predefined tasks
    if (store.get("worktime")) {
        predefinedTasks.push({
            name: "user default",
            workTime: store.get("worktime"),
            restTime: store.get("resttime"),
            loops: store.get('looptime'),
            focusWhenWorking: store.get("fullscreen-work"),
            focusWhenResting: store.get("fullscreen")
        });
        try {
            store.delete("worktime");
            store.delete("resttime");
            store.delete("looptime");
            store.set("predefined-tasks", predefinedTasks);
            store.set("default-task", predefinedTasks.length - 1)//the last is the newest-added
        } catch (e) {
            console.log(e);
        }
    }//alternated the former default time settings

    powerMonitor.on('lock-screen', () => {
        if (store.get("should-stop-locked") !== true) {
            if (powerSaveBlockerId)
                if (powerSaveBlocker.isStarted(powerSaveBlockerId))
                    powerSaveBlocker.stop(powerSaveBlockerId);
            if (win != null) win.webContents.send('alter-start-stop', 'stop');
        }
        if (sleepBlockerId)
            if (powerSaveBlocker.isStarted(sleepBlockerId))
                powerSaveBlocker.stop(sleepBlockerId);
        isScreenLocked = true;
    });

    powerMonitor.on('unlock-screen', () => {
        if (isTimerWin) {
            if (powerSaveBlockerId)
                if (!powerSaveBlocker.isStarted(powerSaveBlockerId))
                    powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
            if (sleepBlockerId)
                if (!powerSaveBlocker.isStarted(sleepBlockerId))
                    sleepBlockerId = powerSaveBlocker.start('prevent-display-sleep');
            if (store.get("should-stop-locked") !== true) {
                if (win != null) win.webContents.send('alter-start-stop', 'start');
            }
            forceScreenLockSolution();
        }
        isScreenLocked = false;
    });

    powerMonitor.on('shutdown', () => {
        win.closable = true;
        app.exit(0);
    });

    if (process.platform === "win32") {
        isShadowless = true;
        styleCache.set("is-shadowless", true);
    }//backport when shadow disabled
})

function hotkeyInit() {
    function isTagNude(tag) {
        return tag.indexOf('Control') === -1 && tag.indexOf('Shift') === -1
            && tag.indexOf('Alt') === -1 && tag.indexOf('Command') === -1 && tag.indexOf('Win') === -1;
    }

    //delete the old style show-or-hide
    if (store.has('hotkey1')) {
        if (isTagNude(store.get('hotkey1')))
            store.set('hotkey.showOrHide', cmdOrCtrl._("long", "pascal") + ' + Alt + Shift + ' + store.get('hotkey1'));
        else
            store.set('hotkey.showOrHide', {
                name: 'showOrHide',
                value: store.get('hotkey1')
            });
        store.delete('hotkey1');
    }

    //delete the old style start-or-stop
    if (store.has('hotkey2')) {
        if (isTagNude(store.get('hotkey2')))
            store.set('hotkey.startOrStop', cmdOrCtrl._("long", "pascal") + ' + Alt + Shift + ' + store.get('hotkey2'));
        else
            store.set('hotkey.startOrStop', {
                name: 'startOrStop',
                value: store.get('hotkey2')
            });
        store.delete('hotkey2');
    }

    //the new, convenient style of hotkey definitions
    const hotkeyList = [
        {
            name: "startOrStop",
            defaultHotkey: 'S',
            function: () => {
                if (isTimerWin) if (win != null) win.webContents.send('start-or-stop');
            }
        },
        {
            name: "showOrHide",
            defaultHotkey: 'W',
            function: () => {
                if (!isTimerWin || (isWorkMode && (workTimeFocused === false))
                    || ((!isWorkMode) && (restTimeFocused === false))
                    || (isLoose && process.platform !== "darwin")) {
                    showOrHide();
                }//prevent using hotkeys to quit
            }
        },
        {
            name: "settings",
            defaultHotkey: 'P',
            function: () => {
                if (!isTimerWin) settings();
            }
        },
        {
            name: "backHome",
            defaultHotkey: 'B',
            function: () => {
                if (isTimerWin && ((isWorkMode && (workTimeFocused === false))
                    || ((!isWorkMode) && (restTimeFocused === false))))
                    win.webContents.send("remote-control-msg", "back");
            }
        },
        {
            name: "nextPeriod",
            defaultHotkey: 'N',
            function: () => {
                if (isTimerWin && ((isWorkMode && (workTimeFocused === false))
                    || ((!isWorkMode) && (restTimeFocused === false))))
                    win.webContents.send("remote-control-msg", "skipper");
            }
        },
        {
            name: "miniMode",
            defaultHotkey: 'M',
            function: () => {
                if (isTimerWin && ((isWorkMode && (workTimeFocused === false))
                    || ((!isWorkMode) && (restTimeFocused === false)))) {
                    if (!hasFloating) win.webContents.send("remote-control-msg", "enter");
                    else {
                        floatingDestroyer("");
                        win.show();
                    }
                }
            }
        }
    ];

    for (i in hotkeyList) {
        if (!store.has("hotkey." + hotkeyList[i].name))
            store.set("hotkey." + hotkeyList[i].name,
                {
                    name: hotkeyList[i].name,
                    value: cmdOrCtrl._("long", "pascal") + ' + Alt + Shift + ' + hotkeyList[i].defaultHotkey
                });
        if (!globalShortcut.isRegistered(store.get('hotkey.' + hotkeyList[i].name).value))
            globalShortcut.register(store.get('hotkey.' + hotkeyList[i].name).value, hotkeyList[i].function);
    }
}

function showOrHide() {
    if (settingsWin != null)
        if (settingsWin.isVisible()) {
            settingsWin.hide();
        } else {
            settingsWin.show();
        }
    if (aboutWin != null)
        if (aboutWin.isVisible()) {
            aboutWin.hide();
        } else {
            aboutWin.show();
        }
    if (tourWin != null)
        if (tourWin.isVisible()) {
            tourWin.hide();
        } else {
            tourWin.show();
        }
    if (win != null)
        if (floatingWin == null)
            if (win.isVisible() && isFocused) {
                win.hide();
            } else {
                win.show()
            }
}

// possible funcs: normal, hide-or-show
function notificationSolution(title, body, func) {
    if (process.env.NODE_ENV === "portable" || !Notification.isSupported()) {
        notifier.notify({
                sound: true,
                timeout: 5,
                title: title,
                message: body,
                silent: false,
                icon: path.join(__dirname, app.isPackaged ? (process.platform === "darwin" ? '../app.asar.unpacked/res/icons/iconMac.png' : '../app.asar.unpacked/res/icons/wnrIcon.png') : "/res/icons/wnrIcon.png")
            },
            function () {
                if (func === "hide-or-show" && win != null) win.show();
            }
        );
    } else {//use native notification api
        let notification = new Notification({ title: title, body: body });
        notification.once("failed", (event, error) => {
            console.log(event + error);
        });
        notification.once("click", (event) => {
            if (func === "hide-or-show" && win != null) win.show();
        });
        notification.show();
    }
}

function traySolution(isFullScreen) {
    if (app.isReady()) {
        if (tray != null) {
            if (!isTimerWin) {
                if (process.platform === "win32") tray.setImage(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
                else tray.setTitle("");
            }
        }
        if (!isFullScreen) {
            if ((!store.get("islocked")) && win != null) win.closable = true;
            if (process.platform === "win32" && win != null) win.setSkipTaskbar(false);
            contextMenu = Menu.buildFromTemplate([{
                label: 'wnr' + i18n.__('v') + require("./package.json").version,
                click: function () {
                    if (!isTimerWin) {
                        if (process.platform === "darwin" && win != null) win.show();
                        about();
                    }
                }
            }, {
                type: 'separator'
            }, {
                label: i18n.__('start-or-stop'),
                enabled: isTimerWin,
                click: function () {
                    if (win != null) win.webContents.send('start-or-stop');
                }
            }, {
                type: 'separator'
            }, {
                enabled: !isTimerWin,
                label: i18n.__('locker-mode'),
                click: function () {
                    if (process.platform === "darwin" && win != null) win.show();
                    locker();
                }
            }, {
                enabled: !isTimerWin,
                label: i18n.__('statistics'),
                click: function () {
                    if (win != null) win.loadFile('statistics.html');
                    if (process.platform === "darwin" && win != null) win.show();
                }
            }, {
                enabled: (!store.get('islocked')) && (!isTimerWin),
                label: i18n.__('settings'),
                click: function () {
                    if (process.platform === "darwin" && win != null) win.show();
                    settings("normal");
                }
            }, {
                enabled: !isTimerWin,
                label: i18n.__('onlyrest'),
                click: function () {
                    if (win != null) {
                        win.loadFile('index.html');
                        win.webContents.once('did-finish-load', function () {
                            win.webContents.send("onlyrest");
                        });
                    }
                    if (process.platform === "darwin" && win != null) win.show();
                }
            }, {
                enabled: !isTimerWin,
                label: i18n.__('positive'),
                click: function () {
                    if (win != null) {
                        win.loadFile('index.html');
                        win.webContents.once('did-finish-load', function () {
                            win.webContents.send("positive");
                        });
                    }
                    if (process.platform === "darwin" && win != null) win.show();
                }
            }, {
                type: 'separator'
            }, {
                label: i18n.__('website'),
                click: function () {
                    shell.openExternal('https://getwnr.com/');
                }
            }, {
                label: i18n.__('github'),
                click: function () {
                    shell.openExternal('https://github.com/RoderickQiu/wnr/');
                }
            }, {
                type: 'separator'
            }, {
                label: i18n.__('show-or-hide'), click: function () {
                    showOrHide()
                }
            }, {
                label: i18n.__('mini-mode'),
                enabled: isTimerWin,
                click: function () {
                    if (win != null) win.webContents.send("remote-control-msg", "enter");
                }
            }, {
                type: 'separator'
            }, {
                label: i18n.__('exit'),
                enabled: !store.get('islocked'),
                click: function () {
                    windowCloseChk()
                }
            }
            ]);
            if (tray != null) {
                tray.removeAllListeners('click');
                if (process.platform !== "linux")
                    tray.on('click', function () {
                        if (fullScreenProtection === false && process.platform === "win32") {
                            showOrHide();
                        }
                    });//tray
                tray.setContextMenu(contextMenu);
                tray.setToolTip("wnr");
            }
        } else {
            if (win != null && (!isLoose)) win.closable = false;
            if (process.platform === "win32" && win != null && (!isLoose)) win.setSkipTaskbar(true);
            contextMenu = Menu.buildFromTemplate([{
                label: 'wnr' + i18n.__('v') + require("./package.json").version
            }, {
                type: 'separator'
            }, {
                label: i18n.__('start-or-stop'),
                click: function () {
                    if (win != null) win.webContents.send('start-or-stop')
                }
            }]);
            if (tray != null) {
                tray.removeAllListeners('click');
                tray.setContextMenu(contextMenu);
                if (process.platform !== "linux")
                    tray.on('click', function () {
                    })
                tray.setToolTip("wnr");
            }
        }
    }
}

function macOSFullscreenSolution(isFullScreen) {
    if (app.isReady()) {
        if (process.platform === 'darwin') {
            //dock
            const dockMenu = Menu.buildFromTemplate([{
                label: i18n.__('show-or-hide'),
                click: () => showOrHide()
            }]);

            app.dock.setMenu(dockMenu);

            //top bar
            let template;
            if (!isFullScreen)
                template = [{
                    label: 'wnr',
                    submenu: [{
                        label: i18n.__('about'),
                        enabled: !isTimerWin,
                        click: function () {
                            about();
                        }
                    }, {
                        type: 'separator'
                    }, {
                        label: i18n.__('quit'),
                        accelerator: 'CmdOrCtrl+Q',
                        enabled: !store.get('islocked'),
                        click: function () {
                            windowCloseChk();
                        }
                    }]
                }, {
                    label: i18n.__('edit'),
                    submenu: [{
                        label: i18n.__('copy'),
                        role: "copy"
                    }, {
                        label: i18n.__('paste'),
                        role: "paste"
                    }, {
                        label: i18n.__('select-all'),
                        role: "selectAll"
                    }, {
                        label: i18n.__('cut'),
                        role: "cut"
                    }]
                }, {
                    label: i18n.__('operations'),
                    submenu: [
                        {
                            label: i18n.__('show-or-hide'), click: function () {
                                showOrHide()
                            }
                        }, {
                            enabled: isTimerWin,
                            label: i18n.__('mini-mode'),
                            click: function () {
                                if (win != null) win.webContents.send("remote-control-msg", "enter");
                            }
                        }, {
                            type: 'separator'
                        }, {
                            enabled: !isTimerWin,
                            label: i18n.__('onlyrest'),
                            click: function () {
                                if (win != null) {
                                    win.loadFile('index.html');
                                    win.webContents.once('did-finish-load', function () {
                                        win.webContents.send("onlyrest");
                                    });
                                }
                                if (process.platform === "darwin" && win != null) win.show();
                            }
                        }, {
                            enabled: !isTimerWin,
                            label: i18n.__('positive'),
                            click: function () {
                                if (win != null) {
                                    win.loadFile('index.html');
                                    win.webContents.once('did-finish-load', function () {
                                        win.webContents.send("positive");
                                    });
                                }
                                if (process.platform === "darwin" && win != null) win.show();
                            }
                        }, {
                            enabled: !isTimerWin,
                            label: i18n.__('statistics'),
                            click: function () {
                                if (win != null) win.loadFile('statistics.html');
                            }
                        }, {
                            enabled: (!store.get('islocked')) && (!isTimerWin),
                            label: i18n.__('settings'),
                            click: function () {
                                settings('normal');
                            }
                        }, {
                            enabled: !isTimerWin,
                            label: i18n.__('locker-mode'),
                            click: function () {
                                locker();
                            }
                        }, {
                            type: 'separator'
                        }, {
                            label: i18n.__('website'),
                            click: function () {
                                shell.openExternal('https://getwnr.com/');
                            }
                        }, {
                            label: i18n.__('github'),
                            click: function () {
                                shell.openExternal('https://github.com/RoderickQiu/wnr/');
                            }
                        }]
                }];
            else
                template = [{
                    label: 'wnr',
                    submenu: [{
                        label: i18n.__('about'),
                        enabled: false
                    }, {
                        type: 'separator'
                    }, {
                        label: i18n.__('quit'),
                        enabled: false
                    }]
                }, {
                    label: i18n.__('operations'),
                    submenu: [{
                        label: i18n.__('settings'),
                        enabled: false
                    }, {
                        label: i18n.__('locker-mode'),
                        enabled: false
                    }, {
                        type: 'separator'
                    }, {
                        label: i18n.__('website'),
                        enabled: false
                    }, {
                        label: i18n.__('github'),
                        enabled: false
                    }]
                }];
            let osxMenu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(osxMenu)
        }
    }
}

function forceScreenLockSolution() {
    if (isLoose || !fullScreenProtection || !isForceScreenLock || store.get("should-stop-locked") !== true) {
        return false;
    }
    try {
        if (process.platform === 'win32') {
            require('child_process').execSync('rundll32 user32.dll,LockWorkStation');
            return true;
        } else if (process.platform === 'darwin') {
            // to be implemented
            return false;
        } else if (process.platform === 'linux') {
            // for distros with systemd
            require('child_process').execSync('loginctl lock-session $(cat /proc/self/sessionid) --no-ask-password');
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

function settingsWinContextMenuSolution() {
    if (app.isReady()) {
        let template = [{
            label: i18n.__('select-all'),
            role: 'selectAll',
        }, {
            label: i18n.__('copy'),
            role: 'copy',
        }, {
            label: i18n.__('paste'),
            role: 'paste',
        }];
        settingsWinContextMenu = Menu.buildFromTemplate(template)
    }
}

function getWindowsReleaseVersion() {
    const os = require('os');
    const release = os.release();
    if (release.startsWith('10.0.2')) {
        return 11;
    } else if (release.startsWith('10.0.1')) {
        return 10;
    } else if (release.startsWith('6.2') || release.startsWith('6.3')) {
        return 8;
    } else if (release.startsWith('6.1')) {
        return 7;
    } else return 0;
}

ipcMain.on("open-notification-settings", function (event, msg) {
    switch (process.platform) {
        case "win32":
            if (getWindowsReleaseVersion() >= 10) shell.openExternal('ms-settings:notifications');
            else dialog.showMessageBox(win, {
                title: " wnr",
                type: "info",
                message: (getWindowsReleaseVersion() === 8) ?
                    i18n.__("open-notification-settings-windows-8-tip") :
                    i18n.__("open-notification-settings-windows-7-tip")
            });
            break;
        case "darwin":
            shell.openExternal("x-apple.systempreferences:com.apple.preference.notifications");
            break;
        case "linux":
            dialog.showMessageBox(win, {
                title: " wnr",
                type: "info",
                message: i18n.__("open-notification-settings-linux-tip")
            });
            break;
    }
})

ipcMain.on("settings-win-context-menu", function (event, message) {
    if (settingsWin != null) {
        try {
            settingsWinContextMenu.popup({ window: settingsWin, x: message.x, y: message.y });
        } catch {
            settingsWinContextMenu.popup({ window: settingsWin });
        }
    }
})

function isDarkMode() {
    if (app.isReady()) {
        if (store.has("dark-or-white")) {
            if (store.get("dark-or-white") === "light") {
                if (win != null) win.setBackgroundColor('#fefefe');
                return false;
            } else {
                if (win != null) win.setBackgroundColor('#191919');
                return true;
            }
        } else {
            styleCache.set('isdark', false);
            darkModeSettingsFinder();
            return styleCache.get('isdark');
        }
    }
}

function darkModeSettingsFinder() {
    if (nativeTheme.shouldUseDarkColors && store.get("dark-or-white") !== "light") {
        styleCache.set('isdark', true);
        if (win != null) {
            win.setBackgroundColor('#191919');
            win.webContents.send('darkModeChanges');
        }
    }
}

function statisticsInitializer() {
    tempDate = new Date();

    year = tempDate.getFullYear().toString();
    yearAndMon = year + months[tempDate.getMonth()];//"mon" represents month
    yearMonDay = yearAndMon + tempDate.getDate().toString();
    statistics.set("year", year);
    statistics.set("mon", months[tempDate.getMonth()]);
    statistics.set("day", tempDate.getDate().toString());
}

function statisticsWriter() {
    statisticsInitializer();

    if (isTimerWin) {
        if (isOnlyRest) {
            let onlyRestTimePeriod = Math.floor((tempDate.getTime() - recorderDate.getTime()) / 60000);
            recorderDate = tempDate;
            statistics.set(yearMonDay, {
                "workTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).workTime : 0,
                "restTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).restTime : 0,
                "positive": statistics.has(yearMonDay) ? statistics.get(yearMonDay).positive : 0,
                "onlyRest": statistics.has(yearMonDay) ? statistics.get(yearMonDay).onlyRest + onlyRestTimePeriod : onlyRestTimePeriod,
                "sum": statistics.has(yearMonDay) ? statistics.get(yearMonDay).sum + onlyRestTimePeriod : onlyRestTimePeriod
            });
            statistics.set(yearAndMon, {
                "workTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).workTime : 0,
                "restTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).restTime : 0,
                "positive": statistics.has(yearAndMon) ? statistics.get(yearAndMon).positive : 0,
                "onlyRest": statistics.has(yearAndMon) ? statistics.get(yearAndMon).onlyRest + onlyRestTimePeriod : onlyRestTimePeriod,
                "sum": statistics.has(yearAndMon) ? statistics.get(yearAndMon).sum + onlyRestTimePeriod : onlyRestTimePeriod
            });
            statistics.set(year, {
                "workTime": statistics.has(year) ? statistics.get(year).workTime : 0,
                "restTime": statistics.has(year) ? statistics.get(year).restTime : 0,
                "positive": statistics.has(year) ? statistics.get(year).positive : 0,
                "onlyRest": statistics.has(year) ? statistics.get(year).onlyRest + onlyRestTimePeriod : onlyRestTimePeriod,
                "sum": statistics.has(year) ? statistics.get(year).sum + onlyRestTimePeriod : onlyRestTimePeriod,
            });
        } else if (isPositiveTiming) {
            let positiveTimePeriod = Math.floor((tempDate.getTime() - recorderDate.getTime()) / 60000);
            recorderDate = tempDate;
            statistics.set(yearMonDay, {
                "workTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).workTime : 0,
                "restTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).restTime : 0,
                "positive": statistics.has(yearMonDay) ? statistics.get(yearMonDay).positive + positiveTimePeriod : positiveTimePeriod,
                "onlyRest": statistics.has(yearMonDay) ? statistics.get(yearMonDay).onlyRest : 0,
                "sum": statistics.has(yearMonDay) ? statistics.get(yearMonDay).sum + positiveTimePeriod : positiveTimePeriod
            });
            statistics.set(yearAndMon, {
                "workTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).workTime : 0,
                "restTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).restTime : 0,
                "positive": statistics.has(yearAndMon) ? statistics.get(yearAndMon).positive + positiveTimePeriod : positiveTimePeriod,
                "onlyRest": statistics.has(yearAndMon) ? statistics.get(yearAndMon).onlyRest : 0,
                "sum": statistics.has(yearAndMon) ? statistics.get(yearAndMon).sum + positiveTimePeriod : positiveTimePeriod
            });
            statistics.set(year, {
                "workTime": statistics.has(year) ? statistics.get(year).workTime : 0,
                "restTime": statistics.has(year) ? statistics.get(year).restTime : 0,
                "positive": statistics.has(year) ? statistics.get(year).positive + positiveTimePeriod : positiveTimePeriod,
                "onlyRest": statistics.has(year) ? statistics.get(year).onlyRest : 0,
                "sum": statistics.has(year) ? statistics.get(year).sum + positiveTimePeriod : positiveTimePeriod,
            });
        } else if (isWorkMode) {
            let workTimePeriod = Math.floor((tempDate.getTime() - recorderDate.getTime()) / 60000);
            recorderDate = tempDate;
            statistics.set(yearMonDay, {
                "workTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).workTime + workTimePeriod : workTimePeriod,
                "restTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).restTime : 0,
                "positive": statistics.has(yearMonDay) ? statistics.get(yearMonDay).positive : 0,
                "onlyRest": statistics.has(yearMonDay) ? statistics.get(yearMonDay).onlyRest : 0,
                "sum": statistics.has(yearMonDay) ? statistics.get(yearMonDay).sum + workTimePeriod : workTimePeriod
            });
            statistics.set(yearAndMon, {
                "workTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).workTime + workTimePeriod : workTimePeriod,
                "restTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).restTime : 0,
                "positive": statistics.has(yearAndMon) ? statistics.get(yearAndMon).positive : 0,
                "onlyRest": statistics.has(yearAndMon) ? statistics.get(yearAndMon).onlyRest : 0,
                "sum": statistics.has(yearAndMon) ? statistics.get(yearAndMon).sum + workTimePeriod : workTimePeriod
            });
            statistics.set(year, {
                "workTime": statistics.has(year) ? statistics.get(year).workTime + workTimePeriod : workTimePeriod,
                "restTime": statistics.has(year) ? statistics.get(year).restTime : 0,
                "positive": statistics.has(year) ? statistics.get(year).positive : 0,
                "onlyRest": statistics.has(year) ? statistics.get(year).onlyRest : 0,
                "sum": statistics.has(year) ? statistics.get(year).sum + workTimePeriod : workTimePeriod
            });
        } else {
            let restTimePeriod = Math.floor((tempDate.getTime() - recorderDate.getTime()) / 60000);
            recorderDate = tempDate;
            statistics.set(yearMonDay, {
                "workTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).workTime : 0,
                "restTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).restTime + restTimePeriod : restTimePeriod,
                "positive": statistics.has(yearMonDay) ? statistics.get(yearMonDay).positive : 0,
                "onlyRest": statistics.has(yearMonDay) ? statistics.get(yearMonDay).onlyRest : 0,
                "sum": statistics.has(yearMonDay) ? statistics.get(yearMonDay).sum + restTimePeriod : restTimePeriod
            });
            statistics.set(yearAndMon, {
                "workTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).workTime : 0,
                "restTime": statistics.has(yearAndMon) ? statistics.get(yearAndMon).restTime + restTimePeriod : restTimePeriod,
                "positive": statistics.has(yearAndMon) ? statistics.get(yearAndMon).positive : 0,
                "onlyRest": statistics.has(yearAndMon) ? statistics.get(yearAndMon).onlyRest : 0,
                "sum": statistics.has(yearAndMon) ? statistics.get(yearAndMon).sum + restTimePeriod : restTimePeriod
            });
            statistics.set(year, {
                "workTime": statistics.has(year) ? statistics.get(year).workTime : 0,
                "restTime": statistics.has(year) ? statistics.get(year).restTime + restTimePeriod : restTimePeriod,
                "positive": statistics.has(year) ? statistics.get(year).positive : 0,
                "onlyRest": statistics.has(year) ? statistics.get(year).onlyRest : 0,
                "sum": statistics.has(year) ? statistics.get(year).sum + restTimePeriod : restTimePeriod
            });
        }
    }
}

function statisticsPauseDealer(startOrStop) {
    if (startOrStop === "start") {
        tempDate = new Date();
        recorderDate = tempDate;
    } else {
        statisticsWriter();
    }
}

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('force-long-focus-request', function () {
    if (win != null)
        dialog.showMessageBox(win, {
            title: " wnr",
            type: "warning",
            message: i18n.__("force-long-focus-request"),
            detail: i18n.__("force-long-focus-request-tip"),
            buttons: (process.platform !== "darwin") ? [i18n.__('cancel'), i18n.__('ok')] : [i18n.__('ok'), i18n.__('cancel')],
            cancelId: (process.platform !== "darwin") ? 0 : 1,//buttons map different from darwin to other OSs
            noLink: true
        }).then(function (index) {
            if (index.response === ((process.platform !== "darwin") ? 1 : 0)) {
                win.webContents.send("force-long-focus-granted");
            }
        });
})

ipcMain.on('focus-mode-settings', function (event, message) {
    workTimeFocused = message.workTimeFocused;
    restTimeFocused = message.restTimeFocused;
    isWorkMode = true;
    recorderDate = new Date()
})

function focusSolution() {
    if (hasFloating) floatingDestroyer("property-stay");
    win.show();
    win.center();
    win.flashFrame(true);
    if (!isLoose) win.setAlwaysOnTop(true, "floating");
    win.moveTop();
    if (dockHide) app.dock.show();//prevent kiosk error, show in dock
    if (!isLoose) multiScreenSolution("on");
    setFullScreenMode(true);
    macOSFullscreenSolution(true);
    traySolution(true);
    if ((process.env.NODE_ENV !== "development") && (!isLoose)) win.setFocusable(false);
    if (sleepBlockerId) {
        if (!powerSaveBlocker.isStarted(sleepBlockerId)) {
            sleepBlockerId = powerSaveBlocker.start('prevent-display-sleep');
        }
    }
}

ipcMain.on("only-rest-fullscreen", function () {
    focusSolution()
})

function nonFocusSolution(mode) {
    if (win != null) {
        multiScreenSolution("off");
        setFullScreenMode(false);
        macOSFullscreenSolution(false);
        traySolution(false);
        win.setFocusable(true);
        if (sleepBlockerId) {
            if (powerSaveBlocker.isStarted(sleepBlockerId)) {
                powerSaveBlocker.stop(sleepBlockerId);
            }
        }
        if (hasFloating) {
            if (floatingWin == null) {
                floating();
            }
            win.hide();
        } else if ((mode === "work" && store.get("when-work-time-end") === 2) || (mode === "rest" && store.get("when-rest-time-end") === 2)) {
        } else {
            win.show();
            win.center();
            win.flashFrame(true);
            if (!isLoose) win.setAlwaysOnTop(true, "floating");
            win.moveTop();
        }
    }
}

function noCheckTimeSolution(mode) {
    if ((mode === "rest" ? workTimeFocused : restTimeFocused) && (!isLoose)) {
        fullScreenProtection = true;
    } else {
        if (store.get("top") !== true) {
            win.setAlwaysOnTop(false);//cancel unnecessary always-on-top
            if ((mode === "work" && store.get("when-work-time-end") === 2) || (mode === "resdt" && store.get("when-rest-time-end") !== 2)) {
            } else if (!hasFloating) win.moveTop();
        }
        if (dockHide) app.dock.hide();
    }
    win.maximizable = false;
}

function timeEndDialogDispose(mode) {
    noCheckTimeSolution(mode);
    win.webContents.send('warning-closed');
}

function personliazationNotificationSolution(i) {
    let title = i18n.__(notificationNamesList[i]), msg = i18n.__(notificationNamesList[i + 1]), random = 0;
    if (personalizationNotificationList[i].length > 0) {
        random = Math.floor(Math.random() * personalizationNotificationList[i].length);
        title = personalizationNotificationList[i][random];
        if (personalizationNotificationList[i + 1].at(random) !== undefined) {
            msg = personalizationNotificationList[i + 1][random];
        } else if (personalizationNotificationList[i + 1].length > 0) {
            random = Math.floor(Math.random() * personalizationNotificationList[i + 1].length);
            msg = personalizationNotificationList[i + 1][random];
        }
    } else {
        if (personalizationNotificationList[i + 1].length > 0) {
            random = Math.floor(Math.random() * personalizationNotificationList[i + 1].length);
            msg = personalizationNotificationList[i + 1][random];
        }
    }
    return [title, msg];
}

ipcMain.on('warning-giver-workend', function () {
    statisticsWriter();

    fullScreenProtection = false;
    if (win != null) {
        win.maximizable = false;
        isWorkMode = false;
        if (restTimeFocused === true) {
            focusSolution();
        } else {
            nonFocusSolution("work");
        }
        let personal = personliazationNotificationSolution(0);
        if (isScreenLocked || store.get("when-work-time-end") === 2) {
            notificationSolution(personal[0],
                personal[1], "normal");
        }

        if (store.get("no-check-work-time-end")) {
            noCheckTimeSolution("work");
            setTimeout(() => win.webContents.send("alter-start-stop", "start"), 1000);
        } else {
            setTimeout(function () {
                if (process.platform !== "darwin" || (process.platform === "darwin" && restTimeFocused))
                    dialog.showMessageBox(win, {
                        title: " wnr",
                        message: personal[0],
                        type: "info",
                        detail: personal[1]
                            + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""),
                    }).then(function () {
                        timeEndDialogDispose("work");
                        //win.webContents.send("alter-start-stop", "start");
                    });
                else dialog.showMessageBox({
                    title: " wnr",
                    message: personal[0],
                    type: "info",
                    detail: personal[1]
                        + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""),
                }).then(function () {
                    timeEndDialogDispose("work");
                    //win.webContents.send("alter-start-stop", "start");
                    if (hasFloating && (process.platform === "darwin")) win.hide();
                })
            }, 1500)
        }
    }
})

ipcMain.on('warning-giver-restend', function () {
    statisticsWriter();

    fullScreenProtection = false;
    if (win != null) {
        win.maximizable = false;
        isWorkMode = true;
        if (workTimeFocused === true) {
            focusSolution();
        } else {
            nonFocusSolution("rest");
        }
        let personal = personliazationNotificationSolution(2);
        if (isScreenLocked || store.get("when-rest-time-end") === 2) {
            notificationSolution(personal[0],
                personal[1], "normal");
        }
        if (store.get("no-check-rest-time-end")) {
            noCheckTimeSolution("rest");
            setTimeout(() => win.webContents.send("alter-start-stop", "start"), 1000);
        } else {
            setTimeout(function () {
                if (process.platform !== "darwin" || (process.platform === "darwin" && workTimeFocused))
                    dialog.showMessageBox(win, {
                        title: " wnr",
                        message: personal[0],
                        type: "info",
                        detail: personal[1]
                            + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""),
                    }).then(function () {
                        timeEndDialogDispose("rest");
                        //win.webContents.send("alter-start-stop", "start");
                    })
                else dialog.showMessageBox({
                    title: " wnr",
                    message: personal[0],
                    type: "info",
                    detail: personal[1]
                        + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""),
                }).then(function () {
                    timeEndDialogDispose("rest");
                    //win.webContents.send("alter-start-stop", "start");
                    if (hasFloating && (process.platform === "darwin")) win.hide();
                })
            }, 1000)
        }
    }
})

ipcMain.on('warning-giver-all-task-end', function () {
    statisticsWriter();

    fullScreenProtection = false;
    if (win != null) {
        win.maximizable = false;
        isWorkMode = false;
        win.show();
        win.center();
        win.flashFrame(true);
        win.setAlwaysOnTop(true, "floating");
        win.moveTop();
        win.setProgressBar(-1);
        if (restTimeFocused === true) {
            multiScreenSolution("off");
            if (dockHide) app.dock.hide();
            setFullScreenMode(false);
            macOSFullscreenSolution(false);
            traySolution(false);
            win.setFocusable(true);
        }
        let personal = personliazationNotificationSolution(4);
        if (isScreenLocked) {
            notificationSolution(personal[0],
                personal[1], "normal");
        }
        if (store.get("no-check-time-end")) {
            win.maximizable = false;
            if (store.get("top") !== true) {
                win.setAlwaysOnTop(false);//cancel unnecessary always-on-top
                win.moveTop();
            }
            if (sleepBlockerId) {
                if (powerSaveBlocker.isStarted(sleepBlockerId)) {
                    powerSaveBlocker.stop(sleepBlockerId);
                }
            }
        } else
            setTimeout(function () {
                dialog.showMessageBox(win, {
                    title: " wnr",
                    message: personal[0],
                    type: "info",
                    detail: personal[1],
                }).then(function () {
                    win.loadFile('index.html');//automatically back
                    setFullScreenMode(false);
                    if (!store.has("suggest-star")) {
                        dialog.showMessageBox(win, {
                            title: " wnr",
                            message: i18n.__('suggest-star'),
                            type: "info",
                            detail: i18n.__('suggest-star-msg'),
                            checkboxLabel: i18n.__('suggest-star-chk'),
                            checkboxChecked: true
                        }).then(function (msg) {
                            if (msg.checkboxChecked) {
                                shell.openExternal("https://github.com/RoderickQiu/wnr");
                            }
                            store.set("suggest-star", "suggested");
                        });
                    }
                    win.maximizable = false;
                    if (store.get("top") !== true) {
                        win.setAlwaysOnTop(false);//cancel unnecessary always-on-top
                        win.moveTop();
                    }
                    if (sleepBlockerId) {
                        if (powerSaveBlocker.isStarted(sleepBlockerId)) {
                            powerSaveBlocker.stop(sleepBlockerId);
                        }
                    }
                })
            }, 1000);
    }
})

ipcMain.on('update-feedback', function (event, message) {
    if (message === "update-available") {
        let updateMessage = "";
        fetch('https://gitee.com/roderickqiu/wnr-backup/raw/master/update.json')
            .then(res => res.json())
            .then(json => {
                for (let updateIterator = 0; updateIterator < json.content[store.get('i18n')].length; updateIterator++) {
                    updateMessage += (updateIterator + 1).toString() + ". " + json.content[store.get('i18n')][updateIterator] + '\r';
                }
                dialog.showMessageBox((settingsWin != null) ? settingsWin : ((aboutWin != null) ? aboutWin : win), {
                    title: " wnr",
                    type: "warning",
                    message: i18n.__('update-msg'),
                    detail: i18n.__('update-content') + "\r" + updateMessage,
                    buttons: [i18n.__('update-refuse'), i18n.__('update-chk'), i18n.__('update-lanzous')],
                    cancelId: 0,
                    noLink: true
                }).then(function (index) {
                    if (index.response === 1) {
                        shell.openExternal("https://github.com/RoderickQiu/wnr/releases/latest");
                    } else if (index.response === 2) {
                        shell.openExternal("https://scris.lanzoui.com/b01n0tb4j");
                    }
                });
            })
            .catch(() => {
                notificationSolution(i18n.__('update-web-problem'), i18n.__('update-web-problem-msg'), "normal");
            });
    } else if (message === "no-update")
        notificationSolution(i18n.__('no-update'), i18n.__('no-update-msg'), "normal");
    else
        notificationSolution(i18n.__('update-web-problem'), i18n.__('update-web-problem-msg'), "normal");
})

ipcMain.on('alert', function (event, message) {
    if (settingsWin != null) {
        dialog.showMessageBox(settingsWin, {
            title: " wnr",
            type: "info",
            message: message
        }).then(function () {
            settingsWin.moveTop();
        });
    } else {
        dialog.showMessageBox(win, {
            title: " wnr",
            type: "info",
            message: message
        })
    }
})

ipcMain.on('delete-all-data', function () {
    if (settingsWin != null) {
        dialog.showMessageBox(settingsWin, {
            title: " wnr",
            message: i18n.__('delete-all-data-dialog-box-title'),
            type: "warning",
            detail: i18n.__('delete-all-data-dialog-box-content'),
            checkboxLabel: i18n.__('delete-all-data-dialog-box-chk'),
            checkboxChecked: false
        }).then(function (msg) {
            if (msg.checkboxChecked || msg.response !== 0) {
                store.clear();
                statistics.clear();
                styleCache.clear();
                timingData.clear();
                relaunchSolution()
            }
        })
    }
})

function windowCloseChk() {
    if ((process.env.NODE_ENV !== "development") && win != null) {
        win.show();
        dialog.showMessageBox(win, {
            title: " wnr",
            message: i18n.__('window-close-dialog-box-title'),
            type: "warning",
            buttons: (process.platform !== "darwin") ? [i18n.__('cancel'), i18n.__('ok')] : [i18n.__('ok'), i18n.__('cancel')],
            cancelId: (process.platform !== "darwin") ? 0 : 1, //buttons map different from darwin to other OSs
            noLink: true
        }).then(function (msger) {
            if (msger.response === ((process.platform !== "darwin") ? 1 : 0)) {
                statisticsWriter();
                multiScreenSolution("off");

                setTimeout(function () {
                    app.exit(0);
                }, 500);
            }
        })
    } else {
        statisticsWriter();
        multiScreenSolution("off");

        setTimeout(function () {
            app.exit(0);
        }, 500);
    }
}

ipcMain.on('window-close-chk', windowCloseChk);

ipcMain.on('global-shortcut-set', function (event, message) {
    let hasFailed = false;
    try {
        if (globalShortcut.isRegistered(message.before))
            globalShortcut.unregister(message.before);
        store.set("hotkey." + message.type, {
            name: message.type,
            value: message.to
        });
        hotkeyInit();
    } catch (e) {
        hasFailed = true;
        notificationSolution(i18n.__('settings'), i18n.__('hotkey-failed'), "normal");
        console.log(e);
    } finally {
        if (hasFailed) {
            store.set("hotkey." + message.type, {
                name: message.type,
                value: message.before
            });
        }
    }
})

ipcMain.on('relauncher', function () {
    try {
        store.set('just-relaunched', true);
    } catch (e) {
        console.log(e);
    }
    relaunchSolution()
})

ipcMain.on('window-hide', function () {
    if (win != null) {
        win.hide()
    }
})

ipcMain.on('window-minimize', function () {
    if (win != null) win.minimize()
})

ipcMain.on('enter-only-rest', function () {
    isOnlyRest = true;
})

ipcMain.on('enter-positive-timing', function () {
    isPositiveTiming = true;
})

function about() {
    if (app.isReady()) {
        if (win != null) {
            aboutWin = new BrowserWindow({
                parent: win,
                width: Math.floor(720 * ratio),
                height: Math.floor(520 * ratio),
                backgroundColor: isDarkMode() ? "#191919" : "#fefefe",
                resizable: false,
                maximizable: false,
                minimizable: false,
                frame: false,
                show: false,
                center: true,
                titleBarStyle: "hidden",
                webPreferences: {
                    nodeIntegration: true,
                    webgl: false,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    spellcheck: false
                },
            });
            require("@electron/remote/main").enable(aboutWin.webContents);
            aboutWin.loadFile("about.html");
            win.setAlwaysOnTop(true, "floating");
            aboutWin.setAlwaysOnTop(true, "floating");
            aboutWin.focus();
            aboutWin.once('ready-to-show', () => {
                aboutWin.show();
                try {
                    let aboutWinTouchBar = new TouchBar({
                        items: [
                            new TouchBarLabel({ label: "wnr " + i18n.__('v') + require("./package.json")["version"] })
                        ]
                    });
                    aboutWinTouchBar.escapeItem = new TouchBarButton({
                        label: i18n.__('close'),
                        click: () => aboutWin.close()
                    });
                    aboutWin.setTouchBar(aboutWinTouchBar);
                } catch (e) {
                    console.log(e);
                }
            })
            aboutWin.on('closed', () => {
                aboutWin = null;
                if (store.get("top") !== true) win.setAlwaysOnTop(false)
            })
        }
    }
}

ipcMain.on('about', about);

function settings(mode) {
    if (app.isReady()) {
        if (win != null && settingsWin == null) {
            settingsWin = new BrowserWindow({
                parent: win,
                width: Math.floor((isChinese ? 420 : 472) * ratio),
                height: Math.floor(636 * ratio),
                backgroundColor: isDarkMode() ? "#191919" : "#fefefe",
                maximizable: false,
                minimizable: false,
                frame: false,
                show: false,
                center: true,
                webPreferences: {
                    nodeIntegration: true,
                    webgl: false,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    spellcheck: false
                },
                titleBarStyle: "hidden"
            });
            require("@electron/remote/main").enable(settingsWin.webContents);
            if (mode === 'locker') store.set("settings-goto", "locker");
            else if (mode === 'predefined-tasks') store.set("settings-goto", "predefined-tasks");
            else store.set("settings-goto", "normal");
            settingsWin.loadFile("preferences.html");
            if (process.env.NODE_ENV !== "development") {
                win.setAlwaysOnTop(true, "floating");
                settingsWin.setAlwaysOnTop(true, "floating");
            }
            settingsWin.focus();
            settingsWin.once('ready-to-show', () => {
                settingsWin.show();
                try {
                    let settingsWinTouchBar = new TouchBar({
                        items: [
                            new TouchBarLabel({ label: i18n.__('newbie-for-settings-tip') })
                        ]
                    });
                    settingsWinTouchBar.escapeItem = new TouchBarButton({
                        label: i18n.__('close'),
                        click: () => settingsWin.close()
                    });
                    settingsWin.setTouchBar(settingsWinTouchBar);
                } catch (e) {
                    console.log(e);
                }
            })
            settingsWin.on('closed', () => {
                if (win != null) {
                    win.reload();
                    if (store.get("top") !== true) win.setAlwaysOnTop(false);
                }
                settingsWin = null;
                isLoose = !!store.get("loose-mode");
                isForceScreenLock = !!store.get("force-screen-lock-mode");
            })
            if (!store.get("settings-experience")) {
                store.set("settings-experience", true);
                notificationSolution(i18n.__('newbie-for-settings'), i18n.__('newbie-for-settings-tip'), "normal");
                if (process.platform === "darwin")
                    notificationSolution(i18n.__('newbie-for-settings'), i18n.__('permission-ask'), "normal")
            }
        }
    }
}

ipcMain.on('settings', settings);

function tourguide() {
    if (app.isReady()) {
        if (win != null && tourWin == null) {
            tourWin = new BrowserWindow({
                parent: win,
                width: Math.floor(400 * ratio),
                height: Math.floor(720 * ratio),
                backgroundColor: isDarkMode() ? "#191919" : "#fefefe",
                resizable: false,
                maximizable: false,
                minimizable: false,
                frame: false,
                show: false,
                center: true,
                titleBarStyle: "hidden",
                webPreferences: {
                    nodeIntegration: true,
                    webgl: false,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    spellcheck: false
                },
            });
            require("@electron/remote/main").enable(tourWin.webContents);
            tourWin.loadFile("tourguide.html");
            win.setAlwaysOnTop(true, "floating");
            tourWin.setAlwaysOnTop(true, "floating");
            tourWin.focus();
            tourWin.once('ready-to-show', () => {
                tourWin.show();
                let tourWinTouchBar = new TouchBar({
                    items: [
                        new TouchBarLabel({ label: i18n.__('welcome-part-1') })
                    ]
                });
                tourWinTouchBar.escapeItem = new TouchBarButton({
                    label: i18n.__('close'),
                    click: () => tourWin.close()
                });
                tourWin.setTouchBar(tourWinTouchBar);
            });
            tourWin.on('closed', () => {
                tourWin = null;
                if (store.get("top") !== true) win.setAlwaysOnTop(false);
                win.moveTop();
                win.focus();
            });
            notificationSolution(i18n.__('welcome-part-1'), i18n.__('welcome-part-2'), "normal");
        }
    }
}

ipcMain.on('tourguide', tourguide);

function predefiner() {
    settings('predefined-tasks');
}

ipcMain.on('predefined-tasks', predefiner);

function locker() {
    settings('locker');
}

ipcMain.on('locker', locker);
ipcMain.on('locker-passcode', function (event, message) {
    let lockerMessage = null;
    if (message === "wrong-passcode") lockerMessage = i18n.__('locker-settings-input-tip-wrong-password');
    if (message === "not-same-password") lockerMessage = i18n.__('locker-settings-not-same-password');
    if (message === "empty") lockerMessage = i18n.__('locker-settings-empty-password');
    if (settingsWin != null)
        dialog.showMessageBox(settingsWin, {
            title: " wnr",
            message: i18n.__('locker'),
            type: "warning",
            detail: lockerMessage
        })
})

ipcMain.on("relaunch-dialog", function (event, message) {
    dialog.showMessageBox(win, {
        title: " wnr",
        type: "warning",
        message: i18n.__("relaunch-tip"),
        buttons: [i18n.__('ok')],
        noLink: true
    }).then(function (index) {
        try {
            store.set('just-relaunched', true);
        } catch (e) {
            console.log(e);
        }
        relaunchSolution();
    });
})

ipcMain.on("open-external-title-win", function (event, message) {
    let title = message.title, notes = message.notes;
    externalTitle(title, notes);
})

ipcMain.on("modify-external-title-win", function (event, message) {
    if (externalTitleWin != null)
        externalTitleWin.webContents.send('send-title', {
            title: message.title,
            notes: message.notes
        });
})

ipcMain.on("sync-timer-win-title", function (event, message) {
    if (win != null && isTimerWin) {
        win.webContents.send('sync-title', {
            title: message.title,
            notes: message.notes
        })
    }
})

ipcMain.on("external-title-resize", function (event, message) {
    if (externalTitleWin != null) {
        externalTitleWin.setSize(Math.floor(Number(message)), 84);
    }
})

ipcMain.on("external-title-destroy", function () {
    if (externalTitleWin != null) {
        hasExternalTitle = false;
        externalTitleWin.close()
    }
})

function externalTitle(title, notes) {
    if (app.isReady()) {
        if (win != null) {
            if (!hasExternalTitle || externalTitleWin == null) {
                hasExternalTitle = true;
                externalTitleWin = new BrowserWindow({
                    width: Math.floor(160 * ratio),
                    height: Math.floor(84 * ratio),
                    x: styleCache.has("external-title-axis") ? styleCache.get("external-title-axis").x : 33,
                    y: styleCache.has("external-title-axis") ? styleCache.get("external-title-axis").y : 33,
                    backgroundColor: isDarkMode() ? "#191919" : "#fefefe",
                    maximizable: false,
                    minimizable: false,
                    frame: false,
                    show: false,
                    center: false,
                    type: 'toolbar',
                    titleBarStyle: "customButtonsOnHover",
                    webPreferences: {
                        nodeIntegration: true,
                        webgl: false,
                        contextIsolation: false,
                        enableRemoteModule: true,
                        spellcheck: false
                    },
                    skipTaskbar: true
                });
                externalTitleWin.loadFile("external-title.html");
                externalTitleWin.webContents.once('did-finish-load', () => {
                    externalTitleWin.show();
                    externalTitleWin.setAlwaysOnTop(true, "pop-up-menu");
                    externalTitleWin.focus();

                    externalTitleWin.webContents.send('send-title', { title: title, notes: notes });
                });
                externalTitleWin.on('closed', () => {
                    externalTitleWin = null;
                    hasExternalTitle = false;
                });
                externalTitleWin.on('move', () => {
                    styleCache.set("external-title-axis", {
                        x: externalTitleWin.getContentBounds().x,
                        y: externalTitleWin.getContentBounds().y
                    });
                })
            }
        }
    }
}

function floating() {
    if (app.isReady()) {
        if (win != null) {
            if (!hasFloating || floatingWin == null) {
                hasFloating = true;
                floatingWin = new BrowserWindow({
                    width: Math.floor(84 * ratio),
                    height: Math.floor(84 * ratio),
                    x: styleCache.has("floating-axis") ? styleCache.get("floating-axis").x : 33,
                    y: styleCache.has("floating-axis") ? styleCache.get("floating-axis").y : 33,
                    backgroundColor: isDarkMode() ? "#191919" : "#fefefe",
                    resizable: false,
                    maximizable: false,
                    minimizable: false,
                    frame: false,
                    show: false,
                    center: false,
                    type: 'toolbar',
                    titleBarStyle: "customButtonsOnHover",
                    webPreferences: {
                        nodeIntegration: true,
                        webgl: false,
                        contextIsolation: false,
                        enableRemoteModule: true,
                        spellcheck: false
                    },
                    skipTaskbar: true
                });
                floatingWin.loadFile("floating.html");
                floatingWin.webContents.once('did-finish-load', () => {
                    floatingWin.show();
                    floatingWin.setAlwaysOnTop(true, "pop-up-menu");
                    floatingWin.focus();
                });
                floatingWin.on('closed', () => {
                    floatingWin = null;
                    hasFloating = false;
                    if (win != null && process.platform === "darwin") {
                        win.show();
                    }
                });
                floatingWin.on('move', () => {
                    styleCache.set("floating-axis", {
                        x: floatingWin.getContentBounds().x,
                        y: floatingWin.getContentBounds().y
                    });
                })
            }
        }
    }
}

ipcMain.on('floating', floating);

function floatingDestroyer(message) {
    if (floatingWin != null) {
        if (message === "") hasFloating = false;
        try {
            floatingWin.close();
        } catch (e) {
            console.log(e);
        }
    }
}

ipcMain.on('floating-destroy', function (event, message) {
    floatingDestroyer(message ? message : "");
});

ipcMain.on('only-one-min-left', function () {
    if (!fullScreenProtection)
        notificationSolution(i18n.__('only-one-min-left'), i18n.__('only-one-min-left-msg'), "non-important")
})

ipcMain.on('tray-image-change', function (event, message) {
    statisticsPauseDealer(message);

    if (tray != null) {
        if (message === "stop") {
            if (process.platform === "win32") tray.setImage(path.join(__dirname, '\\res\\icons\\wnrIconStopped.png'));
            else tray.setTitle(" " + i18n.__('stopped'));
        } else {
            if (process.platform === "win32") tray.setImage(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
            else tray.setTitle(" " + (trayH ? (trayH + ' ' + i18n.__('h')) : "") + trayMin + ' ' + i18n.__('min') + '| ' + (100 - progress * 100) + timeLeftTip);
        }
    }
})

ipcMain.on("progress-bar-set", function (event, message) {
    progress = 1 - message;
    if (win != null) win.setProgressBar(progress);
})

ipcMain.on("tray-time-set", function (event, message) {
    if (store.get("tray-time") !== false || process.platform !== "darwin") {
        trayH = message.h;
        trayMin = message.min;
        trayTimeMsg = (trayH ? (trayH + ' ' + i18n.__('h')) : "") + trayMin + ' ' + i18n.__('min') + '| ' + Math.floor(100 - progress * 100) + timeLeftTip;

        if (tray != null) tray.setToolTip(trayTimeMsg);
        if (process.platform === "darwin") {
            if (timeLeftOnBar != null) timeLeftOnBar.label = trayTimeMsg;
            if (tray != null) tray.setTitle(" " + trayTimeMsg);
            if (win != null) win.maximizable = false;
        }
    } else tray.setTitle("");
});

ipcMain.on("notify", function (event, message) {
    if (message != null) {
        if (message.title != null && message.msg != null)
            notificationSolution(message.title, message.msg, "normal");
        else notificationSolution("wnr", message, "normal")
    }
})

ipcMain.on("logger", function (event, message) {
    console.log(message)
})

ipcMain.on("timer-win", function (event, message) {
    if (win != null) win.maximizable = false;

    if (message) {
        isDarkMode();
        if (aboutWin != null) aboutWin.close();
        if (tourWin != null) tourWin.close();
        if (settingsWin != null) settingsWin.close();
        if (resetAlarm)
            clearTimeout(resetAlarm);
        isAlarmTipOn = false;
        powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');//prevent wnr to be suspended when timing
        isTimerWin = true;
        traySolution();
        macOSFullscreenSolution();
        touchBarSolution("timer");
    } else {
        if (win != null) {
            win.focus();
            win.setProgressBar(-1);
        }
        if (externalTitleWin != null) externalTitleWin.close();

        statisticsWriter();

        if (dockHide) app.dock.hide();
        if (resetAlarm)
            clearTimeout(resetAlarm);
        alarmSet();
        isAlarmTipOn = true;
        if (powerSaveBlockerId)
            if (powerSaveBlocker.isStarted(powerSaveBlockerId))
                powerSaveBlocker.stop(powerSaveBlockerId);
        if (sleepBlockerId)
            if (powerSaveBlocker.isStarted(sleepBlockerId))
                powerSaveBlocker.stop(sleepBlockerId);
        isTimerWin = false;
        traySolution();
        macOSFullscreenSolution();
        touchBarSolution("index");
        multiScreenSolution("off");

        if (store.get("tray-time") !== false && process.platform === "darwin")
            tray.setTitle(' ' + i18n.__('not-timing-tray'));
        else tray.setTitle("");

        isOnlyRest = false;
        isPositiveTiming = false;
    }
})

ipcMain.on("floating-conversation", function (event, message) {
    if (message.topic === "time-left") {
        if (floatingWin != null) floatingWin.webContents.send('floating-time-left', {
            minute: message.val,
            percentage: message.percentage,
            method: message.method,
            isWorking: message.isWorking
        });
    } else if (message.topic === "stop") {
        if (win != null) win.webContents.send('remote-control-msg', 'stop');
    } else if (message.topic === "skip") {
        if (win != null) win.webContents.send('remote-control-msg', 'skipper');
    } else if (message.topic === "recover") {
        if (win != null) {
            win.show();
            win.webContents.send('remote-control-msg', 'closed');
        }
    } else if (message.topic === "back") {
        if (win != null) {
            win.show();
            win.webContents.send('remote-control-msg', 'back');
        }
    } else if (message.topic === "stop-sync") {
        if (floatingWin != null) floatingWin.webContents.send("floating-stop-sync", message.val);
    }
})

ipcMain.on("zoom-ratio-change", function (event, message) {
    ratio = ratioList[message];
    win.setMinimumSize(Math.floor(349 * ratio), Math.floor(444 * ratio));
    win.setSize(Math.floor(360 * ratio), Math.floor(459 * ratio), true);
    settingsWin.setSize(Math.floor((isChinese ? 420 : 472) * ratio), Math.floor(636 * ratio), true);
    win.webContents.send('zoom-ratio-feedback');
})