const Store = require('electron-store');
const store = new Store();
const ipc = require('electron').ipcRenderer;
const nowtime = new Date().getTime();
function updatechecker(method) {
    const version = require("./package.json")["update-use-version"];
    const request = require('request');
    const cheerio = require('cheerio');
    if (method == 2) document.getElementById("manually").innerText = "Checking...";
    request('https://github.com/RoderickQiu/wnr/releases/latest', function (error, response, body) {
        if (body) {
            const $ = cheerio.load(body);
            var title = decodeURI($('title').html());
            title = title.replace(/[^0-9]/g, "");
            if (title > version) {
                ipc.send("updateavailable");
            } else if (method == 2) {// manually
                ipc.send("noupdateavailable");
            }
            if (method == 2) document.getElementById("manually").innerText = "Manually check for update";
        }
    });
    store.set("last-check-time", nowtime);
}
if (store.get("last-check-time") == undefined || store.get("last-check-time") - nowtime > 86400000) {
    updatechecker(1);
}// check for updates every day