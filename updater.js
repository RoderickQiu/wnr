const nowTime = new Date().getTime();
const version = require("./package.json")["version"];
const compareVersion = require('compare-version');

let manuallyCheckText = '';

function updateChecker(method) {
    if (method === 2) {
        manuallyCheckText = document.getElementById("manually").innerHTML;
        document.getElementById("manually").innerHTML = "...";
    }
    ipc.invoke("fetch-latest-version")// fetched in main: gitee sends no CORS headers
        .then(latestVersion => {
            if (compareVersion(latestVersion, version) === 1) {
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
    if (store.get("last-check-time") === undefined || nowTime - store.get("last-check-time") > 86400000) {
        updateChecker(1);
    }// check for updates every day
}
