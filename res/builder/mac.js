const builder = require('electron-builder')
const Platform = builder.Platform

const config = {
    "mac": {
        "target": [
            "dmg"
        ],
        "icon": "res/icons/iconMac.icns",
        "darkModeSupport": true,
        "files": [
            "**/*",
            //! to exclude
            "!res/icons/*Win*",
            "!res/icons/*.psd",
        ]
    },
    "dmg": {
        "icon": "res/icons/iconMac.icns",
        "backgroundColor": "#fefefe",
        "artifactName": "${productName}-${version}-MacOS.${ext}"
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