const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "mac": {
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
        ]
    }
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