const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "directories": {
        "output": "packaged/"
    },
    "win": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**"
        ],
        "target": [
            {
                "target": "nsis",
                "arch": [
                    "ia32"
                ]
            }
        ],
        "icon": "res/icons/iconWin.ico",
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Mac*",
            "!res/icons/*.psd"
        ]
    },
    "nsis": {
        "installerLanguages": [
            "en-US",
            "zh-CN",
            "zh-TW"
        ],
        "guid": "B5BF1EA0-B474-40D3-B31E-6AD92477CCAF",
        "license": "LICENSE",
        "oneClick": false,
        "installerSidebar": "res/builder/nsisResources/installerSidebar.bmp",
        "artifactName": "${productName}-${version}-Setup-32.${ext}",
        "allowToChangeInstallationDirectory": true
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