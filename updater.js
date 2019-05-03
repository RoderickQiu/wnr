const nowtime = new Date().getTime();
function updatechecker(method) {
    var mtext = '';
    if (method == 2) {
        mtext = document.getElementById("manually").innerHTML;
        document.getElementById("manually").innerHTML = "<i class='fa fa-refresh fa-spin fa-fw'></i>";
    }
    const version = require("./package.json")["version"];
    const request = require('request');
    const compareVersion = require('compare-version');
    request('https://raw.githubusercontent.com/RoderickQiu/wnr/master/package.json', function (error, response, body) {
        if (error || response.statusCode != 200) {
            if (method == 2) ipc.send("webproblem");
        } else {
            try {
                let data = JSON.parse(body);
                if (compareVersion(data.version, version) == 1) {
                    ipc.send("updateavailable");
                } else if (method == 2) {// manually
                    ipc.send("noupdateavailable");
                }
            } catch (jsonError) {
                if (method == 2) ipc.send("webproblem");
            }
        }
        if (method == 2) document.getElementById("manually").innerHTML = mtext;
    });
    store.set("last-check-time", nowtime);
}
if (store.get("autocheck") != false) {
    if (store.get("last-check-time") == undefined || store.get("last-check-time") - nowtime > 86400000) {
        updatechecker(1);
    }// check for updates every day
}
