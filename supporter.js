var i18n = require("i18n");
const Store = require('electron-store');
const store = new Store();
const ipc = require('electron').ipcRenderer;
const path = require("path");

i18n.configure({
    locales: ['en', 'zh'],
    directory: __dirname + '/locales'
});
i18n.setLocale(store.get("i18n"));//国际化组件默认设置

function isTimerWindow(isTimer) {
    if (isTimer) {
        ipc.send('timer-win', true);
    } else ipc.send('timer-win', false);
}

function call(content) {
    ipc.send(content);
}