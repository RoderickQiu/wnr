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
            "dir"
        ],
        "files": [
            "**/**",
            //! to exclude
            "!res/icons/**Mac**",
            "!res/icons/**.psd",
            "!designs/**"
        ],
        "icon": "res/icons/iconWin.ico"
    },
    "mac": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**"
        ],
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
            "!./node_modules/node-notifier/vendor/snoreToast/**",
            "!./node_modules/node-notifier/vendor/mac.noindex/**"
        ]
    },
    "publish": null
}

builder.build({
    targets: (process.platform == "darwin") ? Platform.MAC.createTarget() : ((process.platform == "win32") ? Platform.WINDOWS.createTarget() : Platform.LINUX.createTarget()),
    config,
})
    .then(m => {
        if (process.env.NODE_ENV != "msstore") console.log("Done!")
        else console.log("Now, use electron-windows-store for further packaging. ")
    })
    .catch(e => {
        console.error(e)
    })