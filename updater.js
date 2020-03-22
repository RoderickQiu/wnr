const nowTime = new Date().getTime();
const version = require("./package.json")["version"];
const request = require('request');
const compareVersion = require('compare-version');
var manuallyCheckText = '';
function updateChecker(method) {
    if (method == 2) {
        manuallyCheckText = document.getElementById("manually").innerHTML;
        document.getElementById("manually").innerHTML = "...";
    }
    request('https://raw.githubusercontent.com/RoderickQiu/wnr/master/package.json', function (error, response, body) {
        if (error || response.statusCode != 200) {
            if (method == 2) giteeBackupCheck(method);
        } else {
            try {
                let data = JSON.parse(body);
                if (compareVersion(data.version, version) == 1) {
                    ipc.send("update-feedback", "update-available");
                } else if (method == 2) {// manually
                    ipc.send("update-feedback", "no-update");
                }
            } catch (jsonError) {
                if (method == 2) giteeBackupCheck(method);
            }
        }
        if (method == 2) document.getElementById("manually").innerHTML = manuallyCheckText;
    });
    store.set("last-check-time", nowTime);
}
function giteeBackupCheck(method) {//use gitee backup when github isn't accessible
    request('https://gitee.com/roderickqiu/wnr-backup/raw/master/package.json', function (error, response, body) {
        if (error || response.statusCode != 200) {
            if (method == 2) ipc.send("update-feedback", "web-problem");
        } else {
            try {
                let data = JSON.parse(body);
                if (compareVersion(data.version, version) == 1) {
                    ipc.send("update-feedback", "update-available");
                } else if (method == 2) {// manually
                    ipc.send("update-feedback", "no-update");
                }
            } catch (jsonError) {
                if (method == 2) ipc.send("update-feedback", "web-problem");
            }
        }
        if (method == 2) document.getElementById("manually").innerHTML = manuallyCheckText;
    });
}
if (store.get("autocheck") != false) {
    if (store.get("last-check-time") == undefined || store.get("last-check-time") - nowTime > 86400000) {
        updateChecker(1);
    }// check for updates every day
}
