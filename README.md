<p align="center"><img src="https://raw.githubusercontent.com/RoderickQiu/wnr/master/res/icons/wnrIcon.png"
        width="64px" /></p>

<h2 align="center">wnr</h2>

<p align="center">
    <b>The name is an abbr of "Work & Rest". It's a timer app with strong expansibility for devices.</b>
</p>

<p align="center">
    As a timer app, wnr is simple but useful. | <a href="https://scris.top/wnr/">中文简介</a>
</p>

<p align="center">
    <b>Version 2 of wnr is coming out...</b>
</p>

---


## Contact

- Homepage: [wnr.scris.top](https://wnr.scris.top/).

- Downloads: [Releases](https://github.com/RoderickQiu/wnr/releases/).

- Need Help: [Go to Help Page](https://wnr.scris.top/help.html) or [Contact Me](https://roderickqiu.scris.top/).

- Any issues or pull requests are appreciated.

## To-do List

Please go and see the [GitHub Project](https://github.com/RoderickQiu/wnr/projects/1).

## For developing

### Build

```shell

yarn # install

yarn run d # vue-debug

yarn run w # capacitor-web

yarn run e # capacitor-electron

yarn run a # capacitor-android

yarn run win # electron-build-windows

yarn run mac # electron-build-macos

yarn run linux # electron-build-linux

npx cap update # use-this-after-install-a-plugin

```

**We are using [Capacitor](https://capacitor.ionicframework.com/docs/), [Electron](https://electronjs.org/docs) and [Vue](https://vuejs.org/v2/guide/).**

### Folder Structure

- android

    This is the Android project.

- electron

    This is the Electron project.

- public

    This is the folder containing global resources for Vue.

- src

    This is the main folder for Vue developing. It's the main thing in this project.

- www

    This is the folder which Vue exports to. It's not included because it's generated.

- node_modules

    This is the folder containing node resources. It's not included because it's generated.

    _**NOTES:**_
    
    _Please note that we added `node_modules\@capacitor\android\capacitor\src\main\res\drawable\ic_stat_name.png` and modified `node_modules\@capacitor\android\capacitor\src\main\java\com\getcapacitor\plugin\notification\LocalNotificationManager.java` for notification issues._

    _**So you may need to copy `src/assets/notificationIcon.png` to `node_modules\@capacitor\android\capacitor\src\main\res\drawable` and rename it into `ic_stat_name.png`; change the line of code `mBuilder.setSmallIcon(localNotification.getSmallIcon(context));` to `mBuilder.setSmallIcon(R.drawable.ic_stat_name);` and add `channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);` in `createNotificationChannel()` in `LocalNotificationManager.java` the time you set up wnr and every time you update capacitor.**_

## Copyright & Credit

Copyright (c) 2019 **[Roderick Qiu](https://roderickqiu.scris.top)** and other contributors. All rights reserved.

Now licensed under the [MPL2.0 License](https://github.com/RoderickQiu/wnr/blob/master/LICENSE).

For all the packages using, go to the [acknoledgements](https://wnr.scris.top/acknoledgements.html).
