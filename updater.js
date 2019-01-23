const Store = require('electron-store');
const store = new Store();
function updatecheck() {
    const version = require("./package.json")["update-use-version"];
    const request = require('request');
    const cheerio = require('cheerio');
    request('https://github.com/RoderickQiu/wnr/releases/latest', function (error, response, body) {
        if (body) {
            const $ = cheerio.load(body);
            var title = decodeURI($('title').html());
            title = title.replace(/[^0-9]/g, "");
            if (title > version) {
                updatewarning();
            }
        }
    });
}
function updatewarning() {
    const { dialog } = require('electron').remote;
    dialog.showMessageBox({
        title: "New version available!",
        type: "warning",
        message: "A new version of wnr is now available. To enjoy wnr better, you should download and install the update.",
        checkboxLabel: "Go to GitHub and download the new release",
        checkboxChecked: true
    }, function (response, checkboxChecked) {
        if (checkboxChecked) {
            require('electron').shell.openExternal("https://github.com/RoderickQiu/wnr/releases/latest");
        }
    });
}
const nowtime = new Date().getTime();
if (store.get("last-check-time") == undefined || store.get("last-check-time") - nowtime > 86400000) {
    updatecheck();
    store.set("last-check-time", nowtime);
}// check for updates every day