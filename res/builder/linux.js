const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "directories": {
        "output": "packaged/"
    },
    "linux": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**"
        ],
        "target": [
            "dir"
        ],
        "icon": "res/icons/wnrIcon.png",
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Mac*",
            "!res/icons/*Win*",
            "!res/icons/*.psd",
            "!./node_modules/node-notifier/vendor/snoreToast/**"
        ]
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