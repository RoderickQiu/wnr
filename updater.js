const nowTime = new Date().getTime();
const version = require("./package.json")["version"];
const fetch = require('node-fetch');
const compareVersion = require('compare-version');

let manuallyCheckText = '';

function updateChecker(method) {
    if (method === 2) {
        manuallyCheckText = document.getElementById("manually").innerHTML;
        document.getElementById("manually").innerHTML = "...";
    }
    fetch('https://gitee.com/roderickqiu/wnr-backup/raw/master/package.json')
        .then(res => res.json())
        .then(json => {
            if (compareVersion(json.version, version) === 1) {
                ipc.send("update-feedback", "update-available");
            } else if (method === 2) {// manually
                ipc.send("update-feedback", "no-update");
            }
            if (method === 2) document.getElementById("manually").innerHTML = manuallyCheckText;
        })
        .catch(() => {
            if (method === 2) {
                ipc.send("update-feedback", "web-problem");
                document.getElementById("manually").innerHTML = manuallyCheckText;
            }
        });
    store.set("last-check-time", nowTime);
}

if (store.get("autocheck") !== false && process.env.NODE_ENV !== "msstore") {
    if (store.get("last-check-time") === undefined || store.get("last-check-time") - nowTime > 86400000) {
        updateChecker(1);
    }// check for updates every day
}
