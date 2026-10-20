const builder = require('electron-builder')
const Platform = builder.Platform

require("./env_commit")

const config = {
    "electronFuses": require("./fuses"),
    "directories": {
        "output": "packaged/"
    },
    "linux": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**"
        ],
        "target": [
            "AppImage"
        ],
        "icon": "res/icons/wnrIcon.png",
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Mac*",
            "!res/icons/*Win*",
            "!res/icons/*.psd",
            "!./node_modules/node-notifier/vendor/snoreToast/**",
            "!./node_modules/node-notifier/vendor/notifu/**",
            "!./node_modules/node-notifier/vendor/mac.noindex/**"
        ],
        "category": "Utility"
    },
    "appImage": {
        "artifactName": "${productName}-${version}-Linux.${ext}"
    },
    "publish": null
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
        process.exitCode = 1 // so CI fails instead of passing with no build
    })