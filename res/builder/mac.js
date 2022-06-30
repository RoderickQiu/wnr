const builder = require('electron-builder')
const Platform = builder.Platform

require("./env_commit")

const config = {
    "directories": {
        "output": "packaged/"
    },
    "mac": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**",
            "./res/icons/**"
        ],
        "target": {
            "arch": ['arm64', 'x64'],
            "target": 'dmg'
        },
        "icon": "res/icons/iconMac.icns",
        "darkModeSupport": true,
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Win*",
            "!res/icons/*.psd",
            "!./node_modules/node-notifier/vendor/snoreToast/**",
            "!./node_modules/node-notifier/vendor/notifu/**",
            "!./node_modules/node-notifier/vendor/mac.noindex/**"
        ]
    },
    "dmg": {
        "icon": "res/icons/iconMac.icns",
        "background": "res/builder/dmgResources/background.tiff",
        "artifactName": "${productName}-${version}-MacOS-${arch}.${ext}",
        "format": "UDBZ",
        "sign": "false",
        "contents": [{ "x": 350, "y": 170, "type": "link", "path": "/Applications" },
            { "x": 150, "y": 170, "type": "file" }]
    },
    "publish": null
}

builder.build({
    targets: Platform.MAC.createTarget(),
    config,
})
    .then(m => {
        console.log("Done!")
    })
    .catch(e => {
        console.error(e)
    })