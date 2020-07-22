const builder=require("electron-builder"),Platform=builder.Platform,config={directories:{output:"packaged/",app:"output/"},linux:{target:["dir"],icon:"res/icons/wnrIcon.png",files:["**/*",
//! to exclude
"!res/icons/*Mac*","!res/icons/*Win*","!res/icons/*.psd"]}};builder.build({targets:Platform.LINUX.createTarget(),config:config}).then(e=>{console.log(e)}).catch(e=>{console.error(e)});