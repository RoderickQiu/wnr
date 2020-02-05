const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "asarUnpack": [
        "./node_modules/node-notifier/vendor/**"
    ],
    "win": {
        "target": [
            "nsis"
        ],
        "icon": "res/icons/iconWin.ico",
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Mac*",
            "!res/icons/*.psd"
        ],
    },
    "nsis": {
        "installerLanguages": [
            "en-US",
            "zh-CN"
        ],
        "guid": "B5BF1EA0-B474-40D3-B31E-6AD92477CCAF",
        "license": "LICENSE",
        "oneClick": false
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