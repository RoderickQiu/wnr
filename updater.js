const nowtime = new Date().getTime();
function updatechecker(method) {
    var mtext = '';
    if (method == 2) {
        mtext = document.getElementById("manually").innerHTML;
        document.getElementById("manually").innerHTML = "<i class='fa fa-refresh fa-spin fa-fw'></i>&nbsp;";
    }
    const version = require("./package.json")["update-use-version"];
    const request = require('request');
    const cheerio = require('cheerio');
    request('https://github.com/RoderickQiu/wnr/releases/latest', function (error, response, body) {
        if (body) {
            var title = decodeURI(cheerio.load(body)('title').html());
            title = title.replace(/[^0-9]/g, "");
            if (title > version) {
                ipc.send("updateavailable");
            } else if (method == 2) {// manually
                ipc.send("noupdateavailable");
            }
        } else {
            if (method == 2) ipc.send("webproblem");
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