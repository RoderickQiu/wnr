const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "win": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**",
        ],
        "target": [
            "portable"
        ],
        "icon": "res/icons/iconWin.ico",
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Mac*",
            "!res/icons/*.psd"
        ],
        "publisherName": "Roderick Qiu",
        "artifactName": "${productName}-${version}-Portable.${ext}",
    },
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