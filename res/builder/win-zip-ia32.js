const builder = require('electron-builder')
const Platform = builder.Platform

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
                "target": "7z",
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
            "!res/icons/*.psd",
            "!designs/**"
        ],
        "artifactName": "${productName}-${version}-Win-32.${ext}"
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