var i18n = require("i18n");
const Store = require('electron-store');
const store = new Store();
const ipc = require('electron').ipcRenderer;
const path = require("path");
const cmdOrCtrl = require("cmd-or-ctrl")

isInDark();

i18n.configure({
    locales: ['en', 'zh-CN', 'zh-TW'],
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

function getHelp(idCode) {
    require('electron').shell.openExternal(store.get("i18n") == 'zh' ?
        'https://getwnr.com/zh/' + idCode + '.html' :
        'https://getwnr.com/' + idCode + '.html');
}

function isInDark() {
    const isDarkMode = store.get('isdark');
    if (isDarkMode) {
        $('body').append(
            '<style id="darkmode-jetplane">::-webkit-scrollbar-track {background-color: #393939;}\
            ::-webkit-scrollbar-thumb {background-color: #999999;}\
            .dropdown-menu {border-color: #aaaaaa; background-color: #555555;}\
            .dropdown-item:hover {background-color: #aaaaaa;}\
            input[type="range"] {background-color: #aaaaaa33;}\
            body {background-color: #393939;}\
            hr {border-color: #666666;}\
            #title {color: #aaaaaa;}\
            .settings-sidebar-block {color: #fefefe; background-color: #393939;}\
            #loader-wrapper .loader-section {background: #393939;}\
            .dropdown-item, .dropdown-item .text-info {color: #f5f5f5!important;}\
            label, li {color: #f5f5f5;}'
        );
    } else {
        $('#darkmode-jetplane').remove();
    }
}
ipc.on('darkModeChanges', function () {
    isInDark();
})//dark mode settings