const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "asarUnpack": [
        "./node_modules/node-notifier/vendor/**"
    ],
    "mac": {
        "target": [
            "dir"
        ],
        "icon": "res/icons/iconMac.icns",
        "darkModeSupport": true,
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Win*",
            "!res/icons/*.psd",
            "!node_modules/node-notifier/vendor/snoreToast/*"
        ]
    }
}

builder.build({
    targets: Platform.MAC.createTarget(),
    config,
})
    .then(m => {
        console.log(m)
    })
    .catch(e => {
        console.error(e)
    })