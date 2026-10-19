let i18n = require("i18n");
const Store = require('electron-store');
const ipc = require('electron').ipcRenderer;
const path = require("path");
const cmdOrCtrl = require("cmd-or-ctrl");

let store = null;
let isDarkMode = false;

if (process.env.NODE_ENV === "portable") {
    try {
        store = new Store({
            cwd: require('@electron/remote').app.getPath('exe').replace("wnr.exe", ""),
            name: 'wnr-config'
        });//accept portable
    } catch (e) {
        console.log(e);
        store = new Store();
    }
} else store = new Store();
let styleCache = new Store({ name: 'style-cache' });//just contains styling cache
let timingData = new Store({ name: 'timing-data' });//just contains timing cache

isInDark();

const languageList = ['en', 'zh-CN', 'zh-TW', 'ko', 'ar', 'fr'],//locale code
    languageNameList = ['English', '简体中文', '正體中文', '한국어', 'العربية', 'Français'],//real name
    isChinese = store.get("i18n").indexOf("zh") !== -1;

i18n.configure({
    locales: languageList,
    directory: __dirname + '/locales',
    missingKeyFn(locale, value) {
        console.warn(`missing translation of "${ value }" in [${ locale }]!`)
        return `${ value }-[${ locale }]`;
    }
});
i18n.setLocale(store.get("i18n"));//set locale

// Auto-isolate Arabic i18n output so Latin runs render correctly
const _original__ = i18n.__.bind(i18n);
i18n.__ = function (...args) {
    const result = _original__(...args);
    if (store.get("i18n") === 'ar' && typeof result === 'string') {
        return '\u2068' + result + '\u2069';
    }
    return result;
};

// RTL for settings page only
if (store.get("i18n") === 'ar' && window.location.href.includes('preferences.html')) {
    document.documentElement.setAttribute('dir', 'rtl');
}

function isTimerWindow(isTimer) {
    if (isTimer) {
        ipc.send('timer-win', true);
    } else ipc.send('timer-win', false);
}

function call(content) {
    ipc.send(content);
}

function getHelp(idCode) {
    require('electron').shell.openExternal(isChinese ?
        'https://getwnr.com/zh/' + idCode + '.html' :
        'https://getwnr.com/' + idCode + '.html');
}

function isInDark() {
    if (store.get("dark-or-white") === 0 || !store.has("dark-or-white")) {
        isDarkMode = styleCache.get('isdark');
    } else {
        isDarkMode = store.get("dark-or-white") === 2;
    }
    // the dark rules live in style.css under html[data-theme="dark"]
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
}

ipc.on('darkModeChanges', () => {
    isInDark();
    if (typeof reloadTheme === 'function') reloadTheme();
});//dark mode settings
ipc.on('darkModeChanges-settings', function () {
    isInDark();
});//dark mode settings

function amplifyMedia(mediaElem, multiplier) {//freely amplify audio's volume
    var context = new (window.AudioContext || window.webkitAudioContext),
        result = {
            context: context,
            source: context.createMediaElementSource(mediaElem),
            gain: context.createGain(),
            media: mediaElem,
            amplify: function (multiplier) {
                result.gain.gain.value = multiplier;
            },
            getAmpLevel: function () {
                return result.gain.gain.value;
            }
        };
    result.source.connect(result.gain);
    result.gain.connect(context.destination);
    result.amplify(multiplier);
    return result;
}

let amplifierList = [0, 0.15, 0.33, 0.67, 1, 1.5, 3];

function autostartAfter(val) {
    if (process.platform !== "linux") {
        if (val === true) {
            require('@electron/remote').app.setLoginItemSettings({
                openAtLogin: true
            });
        } else {
            require('@electron/remote').app.setLoginItemSettings({
                openAtLogin: false
            });
        }
    } else {
        ipc.send("alert", i18n.__('do-not-support-linux'));
        store.set("autostart", !val);
    }
}

let newRestColor = store.get("theme-color")[0];
let newWorkColor = store.get("theme-color")[1];
let newPositiveColor = store.get("theme-color")[2];
let newOnlyRestColor = store.get("theme-color")[3];