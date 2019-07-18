const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "asarUnpack": [
        "./node_modules/node-notifier/vendor/**"
    ],
    "win": {
        "target": [
            "dir"
        ],
        "icon": "res/icons/iconWin.ico"
    }
}

builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config,
})
    .then(m => {
        console.log("Done!")
    })
    .catch(e => {
        console.error(e)
    })