const builder = require('electron-builder')
const Platform = builder.Platform

require("./env_commit")

const config = {
    "electronFuses": require("./fuses"),
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
                "target": "dir"
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
        process.exitCode = 1 // so CI fails instead of passing with no build
    })