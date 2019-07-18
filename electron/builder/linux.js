const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "asarUnpack": [
        "./node_modules/node-notifier/vendor/**"
    ],
    "linux": {
        "target": [
            "dir"
        ],
        "icon": "res/icons/wnrIcon.png"
    }
}

builder.build({
    targets: Platform.LINUX.createTarget(),
    config,
})
    .then(m => {
        console.log(m)
    })
    .catch(e => {
        console.error(e)
    })