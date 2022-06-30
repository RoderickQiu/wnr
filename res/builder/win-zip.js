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
                "target": "7z",
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
            "!./node_modules/node-notifier/vendor/mac.noindex/**"
        ],
        "artifactName": "${productName}-${version}-Win-${arch}.${ext}"
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