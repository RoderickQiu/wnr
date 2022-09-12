const builder = require('electron-builder')
const Platform = builder.Platform

require("./env_commit")

const config = {
    "directories": {
        "output": "packaged/"
    },
    "win": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**",
            "./res/icons/**"
        ],
        "target": [
            {
                "target": "nsis",
                "arch": ["x64", "ia32"]
            }
        ],
        "icon": "res/icons/iconWin.ico",
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Mac*",
            "!res/icons/*.psd",
            "!designs/**",
            "!./node_modules/node-notifier/vendor/snoreToast/**",
            "!./node_modules/node-notifier/vendor/mac.noindex/**"
        ]
    },
    "nsis": {
        "installerLanguages": [
            "en-US",
            "zh-CN",
            "zh-TW",
            "es-MX"
        ],
        "guid": "B5BF1EA0-B474-40D3-B31E-6AD92477CCAF",
        "license": "LICENSE",
        "oneClick": false,
        "installerSidebar": "res/builder/nsisResources/installerSidebar.bmp",
        "artifactName": "${productName}-${version}-Setup-${arch}.${ext}",
        "allowToChangeInstallationDirectory": true
    },
    "publish": null
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
