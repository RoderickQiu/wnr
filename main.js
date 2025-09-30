const {
    app, BrowserWindow, ipcMain, Tray, Menu,
    globalShortcut, dialog, shell, powerSaveBlocker,
    powerMonitor, nativeTheme, screen, TouchBar, Notification, nativeImage
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
    customDialogWin = null, tray = null, contextMenu = null, settingsWinContextMenu = null,
    resetAlarm = null, powerSaveBlockerId = null, sleepBlockerId = null,
    isTimerWin = null, isWorkMode = null, isChinese = null, isFocused = true, isFullscreenMode = false,
    isOnlyRest = false, isPositiveTiming = false,
    timeLeftTip = null, positiveTimingTip = null, trayTimeMsg = null, predefinedTasks = null,
    trayH = null, trayMin = null,
    workTimeFocused = false, restTimeFocused = false,
    fullScreenProtection = false,
    progress = -1, timeLeftOnBar = null,
    dockHide = false,
    newWindows = [], displays = null, hasMultiDisplays = null,
    isLoose = false, isForceScreenLock = false, isScreenLocked = false,
    isAlarmDialogClosed = true, isShadowless = false, isAlarmTipOn = false, isMaximized = false,
    hasFloating = false, hasExternalTitle = false, hasGotSingleInstanceLock = false,
    kioskInterval = null,
    recorderDate = null, tempDate = null, yearAndMon = null, yearMonDay = null, year = null,
    estimCurrent = 0, todaySum = 0,
    store = null, styleCache = null, statistics = null, timingData = null,
    personalizationNotificationList = [[], [], [], [], [], []],
    isMultiMonitorLoose = false;

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
        maximizable: true,
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

    win.on('enter-full-screen', () => {
        if (process.platform == "darwin") isMaximized = true;
    })

    win.on('leave-full-screen', () => {
        if (process.platform == "darwin") isMaximized = false;
    })

    //prevent app-killers for lock mode / focus mode
    win.webContents.on('render-process-gone', () => {
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
            customDialog("on", i18n.__('alarm-for-not-using-wnr-dialog-box-title'), i18n.__('alarm-for-not-using-wnr-dialog-box-content'), "isAlarmDialogClosed = true;win.show();win.moveTop();alarmSet();");
        }
    }, 600000)//alarm you for using wnr
}

function relaunchSolution() {
    fullScreenProtection = false;
    if (win != null) {
        if (!isLoose) {
            win.setKiosk(false);
        } else {
            setFullScreenMode(false);
        }
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
                        win.setAlwaysOnTop(true, "screen-saver");
                        app.focus({ steal: true });
                        win.setKiosk(true);
                    }
                }, 2500);
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
    newWindows[windowNumber].setAlwaysOnTop(true, "screen-saver");
}

function addLooseMultiScreenSolution(windowNumber, display) {
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
        skipTaskbar: false, // Allow taskbar access in loose mode
        alwaysOnTop: false, // Don't force always on top in loose mode
        focusable: true, // Allow focus in loose mode
        resizable: true, // Allow resizing in loose mode
        minimizable: true, // Allow minimizing in loose mode
        maximizable: true, // Allow maximizing in loose mode
        closable: true // Allow closing in loose mode
    });

    newWindows[windowNumber].loadFile('placeholder.html');
    
    // Use regular fullscreen instead of kiosk mode for loose multi-monitor
    newWindows[windowNumber].setFullScreen(true);
    newWindows[windowNumber].moveTop();
    
    // Add a close button or escape functionality for loose mode
    newWindows[windowNumber].webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape') {
            newWindows[windowNumber].setFullScreen(false);
        }
    });
}

function multiScreenSolution(mode) {
    if (app.isReady()) {
        displays = screen.getAllDisplays();
        hasMultiDisplays = (displays.length > 1);
        try {
            let winBounds = win.getBounds();
            //get the screen that contains the window
            let distScreen = screen.getDisplayNearestPoint({ x: winBounds.x, y: winBounds.y });
            for (i in displays) {
                if (displays[i].id !== distScreen.id) {
                    if (mode === "on") {
                        // For loose mode with multi-monitor support, create less restrictive windows
                        if (isLoose && isMultiMonitorLoose) {
                            addLooseMultiScreenSolution(i, displays[i]);
                        } else {
                            addScreenSolution(i, displays[i]);
                        }
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
        } catch (e) {
            console.log("ERR: multi screen solution failed.");
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

    theThemeHasChanged();
    nativeTheme.on('updated', theThemeHasChanged);

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

    timeLeftTip = i18n.__("time-left");
    positiveTimingTip = i18n.__("positive-timing");//this will be used in this file frequently

    hasGotSingleInstanceLock = app.requestSingleInstanceLock();
    if (!hasGotSingleInstanceLock) {
        console.log('Didn\'t get the lock, quitting');
        app.exit();
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
            if (styleCache.get("win-size").width < 1000 && styleCache.get("win-size").height < 900)
                win.setSize(styleCache.get("win-size").width, styleCache.get("win-size").height);
        }
        win.on('resized', () => {
            styleCache.set("win-size", { "width": win.getSize()[0], "height": win.getSize()[1] });
        });
    }

    hasMultiDisplays = screen.getAllDisplays().length > 1;

    if (store.get("dock-hide") && process.platform === "darwin") dockHide = true;

    if (store.get("loose-mode")) isLoose = true;
    if (store.get("multi-monitor-loose-mode")) isMultiMonitorLoose = true;
    if (store.get("force-screen-lock-mode")) isForceScreenLock = true;

    if (win != null) {
        if (store.get("top") === true) win.setAlwaysOnTop(true, "floating");
        else win.setAlwaysOnTop(false);
    }

    store.set("version", require("./package.json").version);

    statisticsInitializer();

    hotkeyInit();
    themeColorInit();

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

    if (!store.has("suggest-star")) {
        if (!store.has("use-times")) store.set("use-times", 0);
        else store.set("use-times", store.get("use-times") + 1);
    }

    if (!store.has("percentage-break-mode")) store.set("percentage-break-mode", 0);

    if (!store.has("reserved-record")) store.set("reserved-record", 0);
    if (!store.has("reserved-cnt")) store.set("reserved-cnt", 0);//reserved tasks init

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

    if (app.requestSingleInstanceLock()) {
        if (process.platform === "win32") tray = new Tray(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
        else if (process.platform === "darwin") tray = new Tray(path.join(__dirname, '/res/icons/trayIconMacTemplate.png'));
        else if (process.platform === "linux") tray = new Tray(path.join(__dirname, '/res/icons/wnrIcon.png'));
        try {
            tray.setToolTip('wnr');
        } catch (e) {
            console.log(e);
        }
        traySolution(false);
        isFullscreenMode = false;
        macOSFullscreenSolution(false);
        isDarkMode();
        settingsWinContextMenuSolution();
    }

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

    customDialogWin = new BrowserWindow({
        //parent: win,
        width: Math.floor(240 * ratio),
        height: Math.floor(130 * ratio),
        backgroundColor: "#fefefe",
        resizable: false,
        maximizable: false,
        minimizable: false,
        closable: false,
        frame: false,
        show: false,
        center: true,
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
    require("@electron/remote/main").enable(customDialogWin.webContents);
    customDialogWin.loadFile("custom-dialog.html");

    if (!store.has("suggest-star")) {
        if (store.get("use-times") > 8)
            setTimeout(function () {
                customDialog("select_on", i18n.__('suggest-star'),
                    i18n.__('suggest-star-msg'), "shell.openExternal(\"https://github.com/RoderickQiu/wnr\");");
                store.set("suggest-star", "suggested");
            }, 1000);
    }

    if (process.platform === "win32") {
        if (winReleaseId() === -1 && win != null) {
            let isNotified = store.has("windows-7-notification");
            if (isNotified === false) {
                customDialog("on", i18n.__('old-windows-compatibility-notification'), i18n.__('old-windows-compatibility-notification-msg'),
                    "store.set(\"windows-7-notification\", 1);");
            }
        }
    }
})

function getCustomDialogModeType(mode) {
    switch (mode) {
        case "on":
            return 0;
        case "select_on":
            return 1;
        case "update_on":
            return 2;
    }
}

function customDialog(mode, title, msg, executeAfter) {
    if (isMaximized) {
        win.webContents.send("fullscreen-custom-dialog", {
            title: title,
            message: msg,
            executeAfter: executeAfter
        })
        return;
    }
    if (executeAfter == null) executeAfter = "";
    if (mode === "on" || mode === "select_on" || mode === "update_on") {
        if (customDialogWin != null) {
            customDialogWin.webContents.send("dialog-init", {
                title: title,
                msg: msg,
                executeAfter: executeAfter,
                type: getCustomDialogModeType(mode)
            });
            customDialogWin.show();
            customDialogWin.setAlwaysOnTop(true, "pop-up-menu");
            customDialogWin.focus();
            if (mode === "update_on") {
                customDialogWin.setSize(Math.floor(240 * ratio) * 2, customDialogWin.getSize()[1]);
            } else {
                customDialogWin.setSize(Math.floor(240 * ratio), customDialogWin.getSize()[1]);
            }
            customDialogWin.center();
        }
    } else if (mode === "off") {
        if (customDialogWin != null) customDialogWin.hide();
        try {
            eval(executeAfter);
        } catch (e) {
            console.log(e);
        }
    } else if (mode === "cancel") {
        if (customDialogWin != null) customDialogWin.hide();
    } else if (mode === "button3_update") {
        shell.openExternal("https://github.com/RoderickQiu/wnr/releases/latest");

        if (customDialogWin != null) customDialogWin.hide();
    }
}

ipcMain.on("custom-dialog", (event, msg) => {
    if (msg.mode === "on")
        customDialog(msg.mode, msg.title, msg.msg, msg.executeAfter);
    else
        customDialog(msg.mode, "", "", msg.executeAfter);
})

ipcMain.on("custom-dialog-fit", (event, msg) => {
    customDialogWin.setSize(customDialogWin.getSize()[0], Math.floor((115 + msg * 19.25) * ratio));
    customDialogWin.center();
})

function theThemeHasChanged() {
    if (store.has("dark-or-white") && store.get("dark-or-white") === 0) {
        if (nativeTheme.shouldUseDarkColors) {
            styleCache.set('isdark', true);
            if (win != null) {
                win.setBackgroundColor('#191919');
                win.webContents.send('darkModeChanges');
            }
            if (customDialogWin != null) customDialogWin.setBackgroundColor('#191919');
        } else {
            styleCache.set('isdark', false);
            if (win != null) {
                win.setBackgroundColor('#fefefe');
                win.webContents.send('darkModeChanges');
            }
            if (customDialogWin != null) customDialogWin.setBackgroundColor('#fefefe');
        }
    }
}

function themeColorInit() {
    const defaultColors = [
        "#5490ea",
        "#ea5454",
        "#17a2b8",
        "#a26ae5"
    ];
    if (!store.has("theme-color")) {
        store.set("theme-color", defaultColors);
    }
}

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

function getStyledTimeForTray(minute) {
    minute = Number(minute);
    if (minute <= 60)
        return minute + " " + i18n.__("min");
    else
        return Math.floor(minute / 60) + " " + i18n.__("h") +
            (minute - Math.floor(minute / 60) * 60) + i18n.__("min");
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
                label: i18n.__('statistics'),
                type: 'submenu',
                submenu: [{
                    enabled: !isTimerWin,
                    label: i18n.__('statistics-enter'),
                    click: function () {
                        if (win != null) win.loadFile('statistics.html');
                        if (process.platform === "darwin" && win != null) win.show();
                    }
                }, {
                    label: i18n.__('statistics-work-time') + " "
                        + getStyledTimeForTray(statistics.get(yearMonDay).workTime)
                }, {
                    label: i18n.__('statistics-rest-time') + " "
                        + getStyledTimeForTray(statistics.get(yearMonDay).restTime)
                }, {
                    label: i18n.__('onlyrest') + " "
                        + getStyledTimeForTray(statistics.get(yearMonDay).onlyRest)
                }, {
                    label: i18n.__('positive') + " "
                        + getStyledTimeForTray(statistics.get(yearMonDay).positive)
                }, {
                    label: i18n.__('statistics-time-sum') + " "
                        + getStyledTimeForTray(statistics.get(yearMonDay).sum)
                }],
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
                    if (win != null) win.webContents.send("remote-control-msg", "enter")
                }
            }, {
                label: i18n.__('withdraw-timing'),
                enabled: isTimerWin,
                click: function () {
                    if (win != null) win.webContents.send('remote-control-msg', 'back')
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
            else
                customDialog("on", "wnr", (getWindowsReleaseVersion() === 8) ?
                    i18n.__("open-notification-settings-windows-8-tip") :
                    i18n.__("open-notification-settings-windows-7-tip"), "");
            break;
        case "darwin":
            shell.openExternal("x-apple.systempreferences:com.apple.preference.notifications");
            break;
        case "linux":
            customDialog("on", "wnr", i18n.__("open-notification-settings-linux-tip"), "");
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

nativeTheme.on('updated', () => {
    isDarkMode(); // also toggle for dark mode
});

function isDarkMode() {
    if (app.isReady()) {
        if (store.has("dark-or-white") && store.get("dark-or-white") !== 0) {
            if (store.get("dark-or-white") === 1) {
                if (win != null) {
                    win.setBackgroundColor('#fefefe');
                    win.webContents.send('darkModeChanges');
                }
                if (customDialogWin != null) {
                    customDialogWin.setBackgroundColor('#fefefe');
                    customDialogWin.webContents.send('darkModeChanges');
                }
                if (settingsWin != null) {
                    settingsWin.setBackgroundColor('#fefefe');
                    settingsWin.webContents.send('darkModeChanges-settings');
                }
                styleCache.set('isdark', false);
                return false;
            } else {
                if (win != null) {
                    win.setBackgroundColor('#191919');
                    win.webContents.send('darkModeChanges');
                }
                if (customDialogWin != null) {
                    customDialogWin.setBackgroundColor('#191919');
                    customDialogWin.webContents.send('darkModeChanges');
                }
                if (settingsWin != null) {
                    settingsWin.setBackgroundColor('#191919');
                    settingsWin.webContents.send('darkModeChanges-settings');
                }
                styleCache.set('isdark', true);
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
    if (nativeTheme.shouldUseDarkColors && store.get("dark-or-white") !== 1) {
        styleCache.set('isdark', true);
        if (win != null) {
            win.setBackgroundColor('#191919');
            win.webContents.send('darkModeChanges');
        }
        if (customDialogWin != null) {
            customDialogWin.setBackgroundColor('#191919');
            customDialogWin.webContents.send('darkModeChanges');
        }
        if (settingsWin != null) {
            settingsWin.setBackgroundColor('#191919');
            settingsWin.webContents.send('darkModeChanges-settings');
        }
    } else {
        styleCache.set('isdark', false);
        if (win != null) {
            win.setBackgroundColor('#fefefe');
            win.webContents.send('darkModeChanges');
        }
        if (customDialogWin != null) {
            customDialogWin.setBackgroundColor('#fefefe');
            customDialogWin.webContents.send('darkModeChanges');
        }
        if (settingsWin != null) {
            settingsWin.setBackgroundColor('#fefefe');
            settingsWin.webContents.send('darkModeChanges-settings');
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
    statistics.set(yearMonDay, {
        "workTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).workTime : 0,
        "restTime": statistics.has(yearMonDay) ? statistics.get(yearMonDay).restTime : 0,
        "positive": statistics.has(yearMonDay) ? statistics.get(yearMonDay).positive : 0,
        "onlyRest": statistics.has(yearMonDay) ? statistics.get(yearMonDay).onlyRest : 0,
        "sum": statistics.has(yearMonDay) ? statistics.get(yearMonDay).sum : 0
    });
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

    todaySum = statistics.has(yearMonDay) ? statistics.get(yearMonDay).sum : 0;
}

function statisticsPauseDealer(startOrStop) {
    if (startOrStop === "start") {
        tempDate = new Date();
        recorderDate = tempDate;
    } else {
        statisticsWriter();
        traySolution(isFullscreenMode);
    }
}

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('force-long-focus-request', function () {
    if (win != null)
        customDialog("select_on", i18n.__("force-long-focus-request"), i18n.__("force-long-focus-request-tip"), "win.webContents.send(\"force-long-focus-granted\");");
})

ipcMain.on('focus-mode-settings', function (event, message) {
    workTimeFocused = message.workTimeFocused;
    restTimeFocused = message.restTimeFocused;
    isWorkMode = true;
    recorderDate = new Date()
})

function focusSolution() {
    win.center();
    win.flashFrame(true);
    if (!isLoose) win.setAlwaysOnTop(true, "screen-saver");
    win.moveTop();
    if (dockHide) app.dock.show();//prevent kiosk error, show in dock
    if (!isLoose) multiScreenSolution("on");
    // Enable multi-monitor support for loose mode if setting is enabled
    if (isLoose && isMultiMonitorLoose) multiScreenSolution("on");
    setFullScreenMode(true);
    macOSFullscreenSolution(true);
    traySolution(true);
    isFullscreenMode = true;
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
        isFullscreenMode = false;
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
            if (!isLoose) win.setAlwaysOnTop(true, "screen-saver");
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
    //win.maximizable = false;
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

ipcMain.on('eval', function (event, message) {
    try {
        eval(message);
        console.log("Eval succeeded, code: " + message);
    } catch (e) {
        console.log("Eval failed, msg: " + e)
    }
})

ipcMain.on('warning-giver-workend', function () {
    statisticsWriter();

    fullScreenProtection = false;
    if (win != null) {
        //win.maximizable = false;
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
        } else if (!restTimeFocused && !isMaximized) {
            win.setAlwaysOnTop(false);
            setTimeout(function () {
                customDialog("on", personal[0], personal[1]
                    + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""), "timeEndDialogDispose(\"work\"); if(store.get(\"top\") === true) { win.setAlwaysOnTop(true, 'floating'); } if (hasFloating) win.hide();");
            }, 1500);
        } else {
            setTimeout(function () {
                win.webContents.send("fullscreen-custom-dialog", {
                    title: personal[0],
                    message: personal[1] + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""),
                    executeAfter: "timeEndDialogDispose('work'); if (hasFloating) { win.hide(); }"
                })
            }, 1500)
        }
    }

    traySolution(isFullscreenMode);
})

ipcMain.on('warning-giver-restend', function () {
    statisticsWriter();

    fullScreenProtection = false;
    if (win != null) {
        //win.maximizable = false;
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
        } else if (!workTimeFocused && !isMaximized) {
            win.setAlwaysOnTop(false);
            setTimeout(function () {
                customDialog("on", personal[0], personal[1]
                    + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""), "timeEndDialogDispose(\"rest\"); if(store.get(\"top\") === true) { win.setAlwaysOnTop(true, 'floating'); } if (hasFloating) { win.hide(); }");
            }, 1500)
        } else {
            setTimeout(function () {
                win.webContents.send("fullscreen-custom-dialog", {
                    title: personal[0],
                    message: personal[1] + " " + (hasMultiDisplays ? "\r" + i18n.__('has-multi-displays') : ""),
                    executeAfter: "timeEndDialogDispose('rest'); if (hasFloating) { win.hide(); }"
                })
            }, 1500)
        }
    }

    traySolution(isFullscreenMode);
})

ipcMain.on('warning-giver-all-task-end', function () {
    statisticsWriter();

    fullScreenProtection = false;
    if (win != null) {
        //win.maximizable = false;
        isWorkMode = false;
        win.show();
        win.center();
        win.flashFrame(true);
        win.setAlwaysOnTop(true, "screen-saver");
        win.moveTop();
        win.setProgressBar(-1);
        if (restTimeFocused === true) {
            multiScreenSolution("off");
            if (dockHide) app.dock.hide();
            setFullScreenMode(false);
            macOSFullscreenSolution(false);
            traySolution(false);
            isFullscreenMode = false;
            win.setFocusable(true);
        }
        let personal = personliazationNotificationSolution(4);
        if (isScreenLocked) {
            notificationSolution(personal[0],
                personal[1], "normal");
        }
        if (store.get("no-check-time-end")) {
            //win.maximizable = false;
            if (store.get("top") !== true) {
                win.setAlwaysOnTop(false);//cancel unnecessary always-on-top
                win.moveTop();
            }
            if (sleepBlockerId) {
                if (powerSaveBlocker.isStarted(sleepBlockerId)) {
                    powerSaveBlocker.stop(sleepBlockerId);
                }
            }
        } else {
            win.setAlwaysOnTop(false);
            setTimeout(function () {
                customDialog("on", personal[0], personal[1],
                    "win.loadFile('index.html');\n" +
                    "setFullScreenMode(false);\n" +
                    //"win.maximizable = false;\n" +
                    "if (store.get(\"top\") !== true) {\n" +
                    "   win.setAlwaysOnTop(false);//cancel unnecessary always-on-top\n" +
                    "   win.moveTop(); }\n" +
                    "else win.setAlwaysOnTop(true,'floating');\n" +
                    "if (sleepBlockerId) {\n" +
                    "   if (powerSaveBlocker.isStarted(sleepBlockerId)) {\n" +
                    "       powerSaveBlocker.stop(sleepBlockerId); } }");
            }, 1000);
        }
    }

    traySolution(isFullscreenMode);
})

ipcMain.on('update-feedback', function (event, message) {
    // another button usage: button3_update
    if (message === "update-available") {
        let updateMessage = "";
        fetch('https://gitee.com/roderickqiu/wnr-backup/raw/master/update.json')
            .then(res => res.json())
            .then(json => {
                for (let updateIterator = 0; updateIterator < json.content[store.get('i18n')].length; updateIterator++) {
                    updateMessage += (updateIterator + 1).toString() + ". " + json.content[store.get('i18n')][updateIterator] + '\r';
                }
                customDialog("update_on", i18n.__('update'), i18n.__('update-content') + "\r" + updateMessage, "shell.openExternal(\"https://scris.lanzoui.com/b01n0tb4j\");");
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
    customDialog("on", "wnr", message, "");
})

ipcMain.on('can-redo-alert', function () {
    customDialog("off", "", "", "");
    customDialog("select_on", i18n.__("can-redo-title"), i18n.__("can-redo-msg"),
        "win.webContents.send('can-redo-exec');");
})

ipcMain.on('delete-all-data', function () {
    if (settingsWin != null) {
        customDialog("select_on", i18n.__('delete-all-data-dialog-box-title'), i18n.__('delete-all-data-dialog-box-content'), "store.clear();statistics.clear();styleCache.clear();timingData.clear();relaunchSolution()");
    }
})

function windowCloseChk() {
    if ((process.env.NODE_ENV !== "development") && win != null) {
        win.show();
        customDialog("select_on", "wnr", i18n.__('window-close-dialog-box-title'),
            "statisticsWriter();\n" +
            "multiScreenSolution(\"off\");\n" +
            "setTimeout(function () { app.exit(0); }, 500);");
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

ipcMain.on('window-maximize', function () {
    if (win != null) {
        if (isMaximized) {
            win.unmaximize();
            if (process.platform != "darwin") isMaximized = false;
        } else {
            win.maximize();
            if (process.platform != "darwin") isMaximized = true;
        }
    }
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
            win.setAlwaysOnTop(true, "floating");
            settingsWin.setAlwaysOnTop(true, "floating");
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
                isMultiMonitorLoose = !!store.get("multi-monitor-loose-mode");
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
    if (settingsWin != null) customDialog("on", "wnr", i18n.__('locker'), "");
})

ipcMain.on("relaunch-dialog", function (event, message) {
    customDialog("on", "wnr", i18n.__("relaunch-tip"),
        "try { store.set('just-relaunched', true); }" +
        "catch (e) { console.log(e); }\n" +
        "relaunchSolution();");
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
    if (styleCache.has("floating-axis")) {
        // fix that floating window may be out of screen after changing screen resolution
        let isOnScreen = false;
        const displays = screen.getAllDisplays();
        for (let i = 0; i < displays.length; i++) {
            if (displays[i].bounds.x <= styleCache.get("floating-axis").x
                && displays[i].bounds.x + displays[i].bounds.width >= styleCache.get("floating-axis").x
                && displays[i].bounds.y <= styleCache.get("floating-axis").y
                && displays[i].bounds.y + displays[i].bounds.height >= styleCache.get("floating-axis").y) {
                isOnScreen = true;
                break;
            }
        }
        if (!isOnScreen) styleCache.delete("floating-axis");
    }
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
                    // no longer need this
                    /*if (win != null && process.platform === "darwin"){
                        win.show();
                    }*/
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

ipcMain.on('exit-fullscreen', function (event, message) {
    setFullScreenMode(false);
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
            tray.setTitle(" " + i18n.__('stopped'));
        } else {
            if (process.platform === "win32") tray.setImage(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
            if (!isPositiveTiming)
                tray.setTitle((trayH ? (trayH + ' ' + i18n.__('h')) : "") + trayMin + ' ' + i18n.__('min') + '| ' + timeLeftTip + " " + Math.floor(100 - progress * 100) + "% | " + i18n.__('today-total') + (estimCurrent + todaySum) + ' ' + i18n.__('min'));
            else {
                tray.setTitle((trayH ? (trayH + ' ' + i18n.__('h')) : "") + trayMin + ' ' + i18n.__('min') + '| ' + positiveTimingTip + " | " + i18n.__('today-total') + (estimCurrent + todaySum) + ' ' + i18n.__('min'));
            }
        }
    }
})

ipcMain.on("progress-bar-set", function (event, message) {
    progress = 1 - message.progress;
    if (win != null) {
        if (isWorkMode)
            win.setProgressBar(1 - progress, { mode: "error" });
        else
            win.setProgressBar(1 - progress);

        if (!message.positive)
            estimCurrent = progress !== -1 ?
                Math.round(message.remain / (1 - progress)) - message.remain : message.remain;
        else
            estimCurrent = message.remain;
        todaySum = statistics.has(yearMonDay) ? statistics.get(yearMonDay).sum : 0;


        if (process.platform === "win32") {
            win.setOverlayIcon(nativeImage.createFromPath(path.join(__dirname, '\\res\\icons\\overlay\\'
                + (message.remain <= 60 ? message.remain : 61) + '.png')), progress.toString());
            if (message.positive)
                win.setTitle("wnr | " + i18n.__('min-already') + " " + message.remain + " " + i18n.__('min') + " | " + i18n.__('today-total') + getStyledTimeForTray(estimCurrent + todaySum));
            else
                win.setTitle("wnr | " + i18n.__('min-left') + " " + message.remain + " " + i18n.__('min') + " | " + i18n.__('today-total') + getStyledTimeForTray(estimCurrent + todaySum));
        }
    }
})

ipcMain.on("tray-time-set", function (event, message) {
    if (store.get("tray-time") !== false || process.platform !== "darwin") {
        trayH = message.h;
        trayMin = message.min;
        if (message.positive === false)
            trayTimeMsg = (trayH ? (trayH + ' ' + i18n.__('h')) : "") + trayMin + ' ' + i18n.__('min') + '| ' + timeLeftTip + " " + Math.floor(100 - progress * 100) + "% | " + i18n.__('today-total') + (process.platform === "win32" ? getStyledTimeForTray(estimCurrent + todaySum) : ((estimCurrent + todaySum) + ' ' + i18n.__('min')));
        else {
            trayTimeMsg = (trayH ? (trayH + ' ' + i18n.__('h')) : "") + trayMin + ' ' + i18n.__('min') + '| ' + positiveTimingTip + " | " + i18n.__('today-total') + (process.platform === "win32" ? getStyledTimeForTray(estimCurrent + todaySum) : ((estimCurrent + todaySum) + ' ' + i18n.__('min')));
        }

        if (tray != null) tray.setToolTip(trayTimeMsg);
        if (process.platform === "darwin") {
            if (timeLeftOnBar != null) timeLeftOnBar.label = trayTimeMsg;
            if (tray != null) tray.setTitle(" " + trayTimeMsg);
            //if (win != null) win.maximizable = false;
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
    //if (win != null) win.maximizable = false;

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
        if (process.platform === "win32" && win != null) {
            win.setOverlayIcon(null, "");
            win.setTitle("wnr");
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