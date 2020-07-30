const builder = require('electron-builder')
const Platform = builder.Platform

require("./env_commit")

const config = {
    "directories": {
        "output": "packaged/"
    },
    "win": {
        "asarUnpack": [
            "./node_modules/node-notifier/vendor/**"
        ],
        "target": [
            "dir"
        ],
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Mac*",
            "!res/icons/*.psd",
            "!designs/**"
        ]
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