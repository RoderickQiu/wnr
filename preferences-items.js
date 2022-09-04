if (store.get("islocked") !== true) {
    preferenceCreator([
        {
            type: "title",
            id: "timing-setting"
        }, {
            type: "collapse",
            id: "predefined",
            inner: [
                {
                    type: "title",
                    id: "predefined-tasks-settings-tip"
                }, {
                    type: "predefined"
                }
            ],
        }, {
            type: "collapse",
            id: "task-reservation",
            inner: [
                {
                    type: "title",
                    id: "task-reservation-not-stable"
                }, {
                    type: "task-reservation"
                }
            ]
        }, {
            type: "selection",
            id: "loose-mode"
        }, {
            type: "selection",
            id: "force-screen-lock-mode"
        }, {
            type: "collapse",
            id: "timing-strength",
            inner: [{
                type: "dropdown",
                id: "disable-skip",
                choices: ['always', 'work', 'rest', 'never'],
                def: 3,
                tipped: false,
                after: disableSkipAfter
            }, {
                type: "dropdown",
                id: "disable-pause",
                choices: ['always', 'work', 'rest', 'never'],
                def: 3,
                tipped: false,
                after: disablePauseAfter
            }, {
                type: "dropdown",
                id: "disable-back",
                choices: ['always', 'work', 'rest', 'never'],
                def: 3,
                tipped: false,
                after: disableBackAfter
            }]
        }, {
            type: "selection",
            id: "infinity"
        }, {
            type: "dropdown",
            id: "percentage-break-mode",
            choices: ['never', '5%', '7%', '10%', '15%', '20%', '25%', '30%'],
            def: 0
        }, {
            type: "dropdown",
            id: "long-break",
            choices: ['never', 'plus3min', 'plus5min', 'plus7min', 'plus10min', 'plus15min', 'plus20min'],
            def: 0
        }, {
            type: "selection",
            id: "timing-after-locked",
            tipped: false,
            after: timingAfterLockedAfter
        }, {
            type: "title",
            id: "notification-setting"
        }, {
            type: "open-notification-settings"
        }, {
            type: "collapse",
            id: "when-time-end",
            inner: [
                {
                    type: "title",
                    id: "when-work-or-rest-end-tip"
                }, {
                    type: "dropdown",
                    id: "when-work-time-end",
                    choices: ['dialog', 'only-sound', 'notification-no-popup'],
                    def: 0,
                    tipped: false,
                    after: whenWorkTimeEndAfter
                }, {
                    type: "dropdown",
                    id: "when-rest-time-end",
                    choices: ['dialog', 'only-sound', 'notification-no-popup'],
                    def: 0,
                    tipped: false,
                    after: whenRestTimeEndAfter
                }
            ]
        }, {
            type: "selection",
            id: "onemintip",
            def: true
        }, {
            type: "dropdown",
            id: "nap-in-timing",
            choices: ['never', '10min', '15min', '20min'],
            def: 0,
            after: napAfter
        }, {
            type: "selection",
            id: "alarmtip",
            def: true
        }, {
            type: "dropdown",
            id: "sound",
            choices: ['no-sound', 'very-low', 'low', 'medium', 'high', 'very-high', 'extreme'],
            def: 3,
            after: soundAfter
        }, {
            type: "collapse",
            id: "personalization-notify-sound",
            tipped: false,
            inner: [
                {
                    type: "personalization-notify-sound"
                }, {
                    type: "title",
                    id: "personalization-notify-sound-tip"
                }
            ]
        }, {
            type: "collapse",
            id: "personalization-notification",
            tipped: false,
            inner: [
                {
                    type: "personalization-notification"
                }, {
                    type: "title",
                    id: "personalization-notification-tip"
                }
            ]
        }, {
            type: "title",
            id: "global-settings"
        }, {
            type: "i18n"
        }, {
            type: "dropdown",
            id: "zoom-ratio",
            choices: ['zoom-0.75', 'zoom-0.9', 'zoom-1', 'zoom-1.1', 'zoom-1.25'],
            def: 2,
            after: zoomRatioAfter
        }, {
            type: "dropdown",
            id: "start-from-which-day",
            choices: ['from-monday', 'from-sunday'],
            tipped: false,
            def: 1,
            after: startFromWhichDayAfter
        }, {
            type: "dropdown",
            id: "dark-or-white",
            tipped: false,
            relaunch: true,
            choices: ['auto-switch', 'light', 'dark'],
            def: 0
        }, {
            type: "selection",
            id: "autostart",
            after: autostartAfter
        }, {
            type: "selection",
            id: "dock-hide",
            tipped: false,
            relaunch: true
        }, {
            type: "selection",
            id: "top",
            tipped: false,
            relaunch: true
        }, {
            type: "dropdown",
            id: "default-page",
            choices: ['normal-timing', 'stopwatch-mode', 'simple-countdown'],
            def: 0
        }, {
            type: "autocheck"
        }, {
            type: "collapse",
            id: "hotkey",
            tipped: false,
            inner: [
                {
                    type: "hotkey"
                }, {
                    type: "title",
                    id: "hotkey-set-tip"
                }
            ]
        }, {
            type: "collapse",
            id: "data-management",
            inner: [{
                type: "data-management"
            }]
        }, {
            type: "collapse",
            id: "locker",
            inner: [{
                type: "locker"
            }]
        }
    ], $("#settings-container"), false);
} else {
    preferenceCreator([{
        type: "collapse",
        id: "locker",
        inner: [{
            type: "locker"
        }]
    }], $("#settings-container"), false);
    store.set("settings-goto", "locker");
}

/*
    After Functions do comatibility database work
 */

// use '' to prevent "" errors as it is translated to string
function napAfter(val) {
    switch (val) {
        case 0:
            store.set('nap', false);
            break;
        case 1:
            store.set('nap', true);
            store.set('nap-time', 10);
            break;
        case 2:
            store.set('nap', true);
            store.set('nap-time', 15);
            break;
        case 3:
            store.set('nap', true);
            store.set('nap-time', 20);
    }
}

function timingAfterLockedAfter(val) {
    store.set('should-stop-locked', val);
}

function whenWorkTimeEndAfter(val) {
    if (val === 0)
        store.set('no-check-work-time-end', false);
    else
        store.set('no-check-work-time-end', true);
}

function whenRestTimeEndAfter(val) {
    if (val === 0)
        store.set('no-check-rest-time-end', false);
    else
        store.set('no-check-rest-time-end', true);
}

function disableSkipAfter(val) {
    switch (val) {
        case 0:
            store.set('disable-skipping', true);
            store.set('disable-skipping-special', 'all');
            break;
        case 1:
            store.set('disable-skipping', true);
            store.set('disable-skipping-special', 'work');
            break;
        case 2:
            store.set('disable-skipping', true);
            store.set('disable-skipping-special', 'rest');
            break;
        case 3:
            store.set('disable-skipping', false);
            break;
    }
}

function disablePauseAfter(val) {
    switch (val) {
        case 0:
            store.set('disable-pausing', true);
            store.set('disable-pausing-special', 'all');
            break;
        case 1:
            store.set('disable-pausing', true);
            store.set('disable-pausing-special', 'work');
            break;
        case 2:
            store.set('disable-pausing', true);
            store.set('disable-pausing-special', 'rest');
            break;
        case 3:
            store.set('disable-pausing', false);
            break;
    }
}

function disableBackAfter(val) {
    switch (val) {
        case 0:
            store.set('disable-backing', true);
            store.set('disable-backing-special', 'all');
            break;
        case 1:
            store.set('disable-backing', true);
            store.set('disable-backing-special', 'work');
            break;
        case 2:
            store.set('disable-backing', true);
            store.set('disable-backing-special', 'rest');
            break;
        case 3:
            store.set('disable-backing', false);
            break;
    }
}

function startFromWhichDayAfter(val) {
    if (val === 0) store.set('start-from-monday', true);
    else store.set('start-from-monday', false);
}

function zoomRatioAfter(val) {
    ipc.send('zoom-ratio-change', val);
    location.reload()
}

function soundAfter(val) {
    let player = document.createElement('audio');
    amplifyMedia(player, amplifierList[val]);
    player.src = path.join(__dirname, '\\res\\sound\\' + (store.has('time-end-sound') ? store.get('time-end-sound') : 'tick') + '.mp3');
    player.loop = false;
    player.play();
}