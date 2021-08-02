let timeOut = null;//temporary variable

//settings page router
settingsGoto(store.get("settings-goto"));

store.set("just-back", false);

function settingsGoto(mask) {
    if (mask === "locker") {
        $("#settings-helper a").attr("href", "javascript:getHelp('settings/4-lock-mode-settings')");

        $("#locker-sidebar").addClass("settings-sidebar-block-highlighted");
        $("#predefined-tasks-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#other-things-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#global-settings-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#languages-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#personalization-sidebar").removeClass("settings-sidebar-block-highlighted");

        $("#locker").css("display", "block");
        $("#predefined-tasks").css("display", "none");
        $("#global-settings").css("display", "none");
        $("#other-things").css("display", "none");
        $("#languages").css("display", "none");
        $("#personalization").css("display", "none");
    } else if ((mask === "predefined-tasks" || mask === "" || mask == null) && (!store.get('islocked'))) {
        $("#settings-helper a").attr("href", "javascript:getHelp('settings/2-predefined-tasks-settings')");

        $("#locker-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#predefined-tasks-sidebar").addClass("settings-sidebar-block-highlighted");
        $("#other-things-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#global-settings-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#languages-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#personalization-sidebar").removeClass("settings-sidebar-block-highlighted");

        $("#locker").css("display", "none");
        $("#predefined-tasks").css("display", "block");
        $("#global-settings").css("display", "none");
        $("#other-things").css("display", "none");
        $("#languages").css("display", "none");
        $("#personalization").css("display", "none");
    } else if (mask === "languages" && (!store.get('islocked'))) {
        $("#settings-helper a").attr("href", "javascript:getHelp('settings/6-languages')");

        $("#locker-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#predefined-tasks-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#other-things-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#global-settings-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#languages-sidebar").addClass("settings-sidebar-block-highlighted");
        $("#personalization-sidebar").removeClass("settings-sidebar-block-highlighted");

        $("#locker").css("display", "none");
        $("#predefined-tasks").css("display", "none");
        $("#global-settings").css("display", "none");
        $("#other-things").css("display", "none");
        $("#languages").css("display", "block");
        $("#personalization").css("display", "none");
    } else if ((mask === "global-settings" || mask === "normal") && (!store.get('islocked'))) {
        $("#settings-helper a").attr("href", "javascript:getHelp('settings/3-global-settings')");

        $("#locker-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#predefined-tasks-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#other-things-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#global-settings-sidebar").addClass("settings-sidebar-block-highlighted");
        $("#languages-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#personalization-sidebar").removeClass("settings-sidebar-block-highlighted");

        $("#locker").css("display", "none");
        $("#predefined-tasks").css("display", "none");
        $("#global-settings").css("display", "block");
        $("#other-things").css("display", "none");
        $("#languages").css("display", "none");
        $("#personalization").css("display", "none");
    } else if (mask === "other-things" && (!store.get('islocked'))) {
        $("#settings-helper a").attr("href", "javascript:getHelp('settings/5-other-things')");

        $("#locker-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#predefined-tasks-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#other-things-sidebar").addClass("settings-sidebar-block-highlighted");
        $("#global-settings-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#languages-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#personalization-sidebar").removeClass("settings-sidebar-block-highlighted");

        $("#locker").css("display", "none");
        $("#predefined-tasks").css("display", "none");
        $("#global-settings").css("display", "none");
        $("#other-things").css("display", "block");
        $("#languages").css("display", "none");
        $("#personalization").css("display", "none");
    } else if (mask === "personalization" && (!store.get('islocked'))) {
        $("#settings-helper a").attr("href", "javascript:getHelp('settings/7-personalization')");

        $("#locker-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#predefined-tasks-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#other-things-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#global-settings-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#languages-sidebar").removeClass("settings-sidebar-block-highlighted");
        $("#personalization-sidebar").addClass("settings-sidebar-block-highlighted");

        $("#locker").css("display", "none");
        $("#predefined-tasks").css("display", "none");
        $("#global-settings").css("display", "none");
        $("#other-things").css("display", "none");
        $("#languages").css("display", "none");
        $("#personalization").css("display", "block");
    }
}

//defaults settings
let defaultArray = store.get("predefined-tasks");
const newItem = {
    name: "new item",
    workTime: 30,
    restTime: 10,
    loops: 4,
    focusWhenWorking: false,
    focusWhenResting: false
};
defaultArray.forEach(function (item, index, array) {
    planAppend(item, index);
});
if (store.has("default-task")) setAsDefault(store.get("default-task"));

function planEdit(index) {
    defaultArray[index].name = $("#title" + index).val();
    if (!isNaN(Number($("#work-time" + index).val())) && Number($("#work-time" + index).val()) >= 0.083) defaultArray[index].workTime = $("#work-time" + index).val();
    else $("#work-time" + index).val(defaultArray[index].workTime);
    if (!isNaN(Number($("#rest-time" + index).val())) && Number($("#rest-time" + index).val()) >= 0.083) defaultArray[index].restTime = $("#rest-time" + index).val();
    else $("#rest-time" + index).val(defaultArray[index].restTime);
    if (!isNaN(Number($("#loops" + index).val())) && Number($("#loops" + index).val()) >= 1) defaultArray[index].loops = $("#loops" + index).val();
    else $("#loops" + index).val(defaultArray[index].loops);
    defaultArray[index].focusWhenWorking = !!document.getElementById("focus-when-working" + index).checked;
    defaultArray[index].focusWhenResting = !!document.getElementById("focus-when-resting" + index).checked;
    store.set("predefined-tasks", defaultArray);
}

function planAppend(item, index) {
    $("#itemlist-ul").append(
        "<li id='item" + index + "'> <input name='title' id='title" + index + "' type='text' class='lead rest' maxlength='15' value='" +
        item.name + "' onchange='planEdit(" + index + ")' /> <br /><div class='text-muted small'>" +
        i18n.__('predefined-tasks-settings-tip-part-1') + " <input id='work-time" + index + "' class='hotkeyset' type='number' value='" +
        item.workTime + "' onchange='planEdit(" + index + ")' oninput='if (value.length > 3) value = value.slice(0, 3)' style='ime-mode:Disabled' title=" + i18n.__('what-can-be-here-predefined-tasks') + " /> " +
        i18n.__('min') +
        i18n.__('predefined-tasks-settings-tip-part-2') + " <input id='rest-time" + index + "' class='hotkeyset' type='number' value='" +
        item.restTime + "' onchange='planEdit(" + index + ")' oninput='if (value.length > 3) value = value.slice(0, 3)' style='ime-mode:Disabled' title=" + i18n.__('what-can-be-here-predefined-tasks') + " /> " +
        i18n.__('min') +
        i18n.__('predefined-tasks-settings-tip-part-3') + " <input id='loops" + index + "' class='hotkeyset' type='number' value='" +
        item.loops + "' onchange='planEdit(" + index + ")' oninput='if (value.length > 2) value = value.slice(0, 2)' style='ime-mode:Disabled' /> " +
        i18n.__('time(s)') +
        "<br />" + i18n.__('focus-when-working') + " <input id='focus-when-working" + index + "' type='checkbox' onchange='planEdit(" + index + ")' />&nbsp;&nbsp;|&nbsp;" +
        i18n.__('focus-when-resting') + " <input id='focus-when-resting" + index + "' type='checkbox' onchange='planEdit(" + index + ")' />\
                <br /><span id='set-as-default-task-container" + index + "'><a class='rest underlined' href='javascript:setAsDefault(" + index + ")'>" + i18n.__('set-as-default-task') + "</a> | </span>\
                <span id='deleter" + index + "'><a href='javascript:planErase(" + index + ")' class='work underlined'>" + i18n.__('delete') + "</a></span>\
                </div><hr /></li>"
    );
    document.getElementById("focus-when-working" + index).checked = item.focusWhenWorking;
    document.getElementById("focus-when-resting" + index).checked = item.focusWhenResting;
}

function planErase(index) {
    defaultArray.splice(index, 1);
    store.set("predefined-tasks", defaultArray);
    $("#item" + index).remove();
}

function planAdd() {
    defaultArray.push(newItem);
    store.set("predefined-tasks", defaultArray);
    planAppend(newItem, defaultArray.length - 1);
    store.set("settings-goto", "predefined-tasks");
    location.reload();
}

function setAsDefault(index) {
    $("#deleter" + store.get("default-task")).css("display", "inline");
    $("#set-as-default-task-container" + store.get("default-task")).css("display", "inline");
    $('#title' + store.get("default-task")).removeClass("work");
    $('#title' + store.get("default-task")).addClass("rest");
    store.set("default-task", index);
    $("#deleter" + index).css("display", "none");
    $("#set-as-default-task-container" + index).css("display", "none");
    $('#title' + index).removeClass("rest");
    $('#title' + index).addClass("work");
}

//language settings
for (i in languageList) {
    $("#language-select").append("\
            <a class='dropdown-item' href='javascript:languageSetting(\"" + languageList[i] + "\")'>"
        + languageNameList[i] + "</a>");
    if (store.get("i18n") === languageList[i]) {
        $("#language-dropdown-button").text(languageNameList[i]);
    }
}

function languageSetting(val) {
    if (store.get('i18n') !== val) {
        store.set("i18n", val);
        timeOut = setTimeout("call('relauncher')", 500);
    }
}

//global settings
if (store.get("sound") !== undefined) {
    document.getElementById("notifying-sound-setting").checked = !!store.get("sound");
}

function notifyingSoundSetting() {
    if (document.getElementById("notifying-sound-setting").checked === true) store.set("sound", true);
    else store.set("sound", false);
}

if (store.get("top") !== undefined) {
    document.getElementById("always-on-top-setting").checked = store.get("top") === true;
}

function alwaysOnTopSetting() {
    if (document.getElementById("always-on-top-setting").checked === true) store.set("top", true);
    else store.set("top", false);
    timeOut = setTimeout("call('relauncher')", 500);
}

let AutoLaunch = require('auto-launch');
let wnrLauncher = new AutoLaunch({ name: 'wnr' });
wnrLauncher.isEnabled()
    .then(function (isEnabled) {
        document.getElementById("auto-start-setting").checked = !!isEnabled;
    }).catch(function (error) {
    ipc.send("alert", i18n.__('without-permission-part-1') + ((process.platform === "darwin") ? i18n.__('without-permission-part-2') : ""));
})

function autoStartSetting() {
    if (document.getElementById("auto-start-setting").checked === true) {
        store.set("autostart", true);
        wnrLauncher.isEnabled()
            .then(function (isEnabled) {
                if (isEnabled) {
                    return;
                }
                wnrLauncher.enable();
            }).catch(function (error) {
            store.set("autostart", false);
            document.getElementById("auto-start-setting").checked = false;
            ipc.send("alert", i18n.__('without-permission-part-1') + ((process.platform === "darwin") ? i18n.__('without-permission-part-2') : ""));
        })
    } else {
        store.set("autostart", false);
        wnrLauncher.isEnabled()
            .then(function (isEnabled) {
                if (isEnabled) {
                    wnrLauncher.disable();
                }
            }).catch(function (error) {
            store.set("autostart", true);
            document.getElementById("auto-start-setting").checked = true;
            ipc.send("alert", i18n.__('without-permission-part-1') + ((process.platform === "darwin") ? i18n.__('without-permission-part-2') : ""));
        })
    }
}

document.getElementById("auto-check-update-setting").checked = store.get("autocheck") !== false;

function autoCheckSetting() {
    if (document.getElementById("auto-check-update-setting").checked === true) store.set("autocheck", true);
    else store.set("autocheck", false);
}

document.getElementById("alarm-for-not-using-wnr-dialog-box-title-setting").checked = store.get("alarmtip") !== false;

function alarmForNotUsingSetting() {
    if (document.getElementById("alarm-for-not-using-wnr-dialog-box-title-setting").checked === true) store.set("alarmtip", true);
    else store.set("alarmtip", false);
}

document.getElementById("one-min-left-notification-setting").checked = store.get("onemintip") !== false;

function oneMinLeftNotificationSetting() {
    if (document.getElementById("one-min-left-notification-setting").checked === true) store.set("onemintip", true);
    else store.set("onemintip", false);
}

document.getElementById("auto-start-task-setting").checked = store.get("autostarttask") === true;

function autoStartDefaultTaskSetting() {
    if (document.getElementById("auto-start-task-setting").checked === true) store.set("autostarttask", true);
    else store.set("autostarttask", false);
}

document.getElementById("local-time-setting").checked = store.get("localtime") !== false;

function localTimeSetting() {
    if (document.getElementById("local-time-setting").checked !== false) store.set("localtime", true);
    else store.set("localtime", false);
}

document.getElementById("infinity-mode-setting").checked = store.get("infinity") === true;

function infinityModeSetting() {
    if (document.getElementById("infinity-mode-setting").checked === true) store.set("infinity", true);
    else store.set("infinity", false);
}

document.getElementById("hide-from-dock-setting").checked = store.get("dock-hide") === true;

function hideFromDockSetting() {
    if (document.getElementById("hide-from-dock-setting").checked === true) store.set("dock-hide", true);
    else store.set("dock-hide", false);
    timeOut = setTimeout("call('relauncher')", 500);
}

document.getElementById("top-bar-time-setting").checked = store.get("tray-time") !== false;

function topBarTimeSetting() {
    if (document.getElementById("top-bar-time-setting").checked !== false) store.set("tray-time", true);
    else store.set("tray-time", false);
}

if (store.get("nap") === true) document.getElementById("nap-setting").checked = true;
else {
    document.getElementById("nap-setting").checked = false;
    $("#nap-time-set").css("display", "none");
}
if (store.has("nap-time")) $("#nap-time-msg").val(store.get("nap-time"));
else $("#nap-time-msg").val(10);

function napSetting() {
    if (document.getElementById("nap-setting").checked === true) {
        store.set("nap", true);
        $("#nap-time-set").css("display", "inline-block");
    } else {
        store.set("nap", false);
        $("#nap-time-set").css("display", "none");
    }
}

function napTimeChange() {
    let napTimeGet = Number($("#nap-time-msg").val());
    if (isNaN(napTimeGet)) $("#nap-time-msg").val(10);
    else if (napTimeGet < 1) $("#nap-time-msg").val(10);
    store.set("nap-time", Number($("#nap-time-msg").val()));
}

document.getElementById("loose-setting").checked = store.get("loose-mode") === true;

function looseSetting() {
    if (document.getElementById("loose-setting").checked === true) store.set("loose-mode", true);
    else store.set("loose-mode", false);
}

document.getElementById("check-after-work-time-end-setting").checked = store.get("no-check-work-time-end") !== true;

function checkAfterWorkTimeEndSetting() {
    if (document.getElementById("check-after-work-time-end-setting").checked === true) store.set("no-check-work-time-end", false);
    else store.set("no-check-work-time-end", true);
}

document.getElementById("check-after-rest-time-end-setting").checked = store.get("no-check-rest-time-end") !== true;

function checkAfterRestTimeEndSetting() {
    if (document.getElementById("check-after-rest-time-end-setting").checked === true) store.set("no-check-rest-time-end", false);
    else store.set("no-check-rest-time-end", true);
}

if (store.get("disable-backing") === true) {
    document.getElementById("disable-backing-setting").checked = true;
    if (store.get("disable-backing-special") === "work")
        $("#disable-backing-set-button").html(i18n.__('statistics-work-time'));
    else if (store.get("disable-backing-special") === "rest")
        $("#disable-backing-set-button").html(i18n.__('statistics-rest-time'));
    else
        $("#disable-backing-set-button").html(i18n.__('all-time'));
} else {
    document.getElementById("disable-backing-setting").checked = false;
    $("#disable-backing-set").css("display", "none");
}

function disableBackingSpecialChange(type) {
    store.set("disable-backing-special", type);
    if (type === "work")
        $("#disable-backing-set-button").html(i18n.__('statistics-work-time'));
    else if (type === "rest")
        $("#disable-backing-set-button").html(i18n.__('statistics-rest-time'));
    else
        $("#disable-backing-set-button").html(i18n.__('all-time'));
}

function disableBackingSetting() {
    if (document.getElementById("disable-backing-setting").checked === true) {
        store.set("disable-backing", true);
        $("#disable-backing-set").css("display", "inline-block");
    } else {
        store.set("disable-backing", false);
        $("#disable-backing-set").css("display", "none");
    }
}

if (store.get("disable-skipping") === true) {
    document.getElementById("disable-skipping-setting").checked = true;
    if (store.get("disable-skipping-special") === "work")
        $("#disable-skipping-set-button").html(i18n.__('statistics-work-time'));
    else if (store.get("disable-skipping-special") === "rest")
        $("#disable-skipping-set-button").html(i18n.__('statistics-rest-time'));
    else
        $("#disable-skipping-set-button").html(i18n.__('all-time'));
} else {
    document.getElementById("disable-skipping-setting").checked = false;
    $("#disable-skipping-set").css("display", "none");
}

function disableSkippingSpecialChange(type) {
    store.set("disable-skipping-special", type);
    if (type === "work")
        $("#disable-skipping-set-button").html(i18n.__('statistics-work-time'));
    else if (type === "rest")
        $("#disable-skipping-set-button").html(i18n.__('statistics-rest-time'));
    else
        $("#disable-skipping-set-button").html(i18n.__('all-time'));
}

function disableSkippingSetting() {
    if (document.getElementById("disable-skipping-setting").checked === true) {
        store.set("disable-skipping", true);
        $("#disable-skipping-set").css("display", "inline-block");
    } else {
        store.set("disable-skipping", false);
        $("#disable-skipping-set").css("display", "none");
    }
}

if (store.get("disable-pausing") === true) {
    document.getElementById("disable-pausing-setting").checked = true;
    if (store.get("disable-pausing-special") === "work")
        $("#disable-pausing-set-button").html(i18n.__('statistics-work-time'));
    else if (store.get("disable-pausing-special") === "rest")
        $("#disable-pausing-set-button").html(i18n.__('statistics-rest-time'));
    else
        $("#disable-pausing-set-button").html(i18n.__('all-time'));
} else {
    document.getElementById("disable-pausing-setting").checked = false;
    $("#disable-pausing-set").css("display", "none");
}

function disablePausingSpecialChange(type) {
    store.set("disable-pausing-special", type);
    if (type === "work")
        $("#disable-pausing-set-button").html(i18n.__('statistics-work-time'));
    else if (type === "rest")
        $("#disable-pausing-set-button").html(i18n.__('statistics-rest-time'));
    else
        $("#disable-pausing-set-button").html(i18n.__('all-time'));
}

function disablePausingSetting() {
    if (document.getElementById("disable-pausing-setting").checked === true) {
        store.set("disable-pausing", true);
        $("#disable-pausing-set").css("display", "inline-block");
    } else {
        store.set("disable-pausing", false);
        $("#disable-pausing-set").css("display", "none");
    }
}

document.getElementById("still-count-setting").checked = store.get("should-stop-locked") === true;

function stillCountSetting() {
    if (document.getElementById("still-count-setting").checked === true) store.set("should-stop-locked", true);
    else store.set("should-stop-locked", false);
}

//advanced settings
function lock(passcode, again) {
    let md5 = require('crypto-js/md5');
    if (passcode === "" || again === "") ipc.send("locker-passcode", 'empty');
    else if (!store.get('islocked')) {
        if (passcode === again) {
            store.set('lockerpasscode', md5(passcode).toString());
            store.set('islocked', true);
            ipc.send("locker-passcode", 'lock-mode-on');
            window.close();
        } else ipc.send("locker-passcode", 'not-same-password');
    } else {
        if (passcode === again) {
            if (passcode === store.get('lockerpasscode') || md5(passcode).toString() === store.get('lockerpasscode')) {
                store.set('islocked', false);
                ipc.send("locker-passcode", 'lock-mode-off');
                window.close();
            } else ipc.send("locker-passcode", 'wrong-passcode');
        } else ipc.send("locker-passcode", 'not-same-password');
    }
}

let reservedUseDefaultArray = store.get("predefined-tasks");
let reservedArray = store.has("reserved") ? store.get("reserved") : [];
let newReservedItem = {
    id: store.get("reserved-record") + 1,
    time: "23:59",
    endTime: "24:00",
    plan: "0",
    cycle: "0"
};
reservedArray.forEach(function (item, index, array) {
    reservedAppend(item, index);
});

function reservedAppend(item, index) {
    $("#reservation-list").append('<li id="reserved-' + index + '">\
        ' + i18n.__('task-reservation-time-setting') + ' <input id="reserved-time-' + index + '" type="time"\
        onchange="reservedEdit(' + index + ')" value="' + item.time + '" />&nbsp;&nbsp;&nbsp;|&nbsp;'
        + i18n.__('task-reservation-follow-plan') +
        '<div class="dropdown dropdown-default">\
            <a class="btn btn-outline-secondary dropdown-toggle dropdown-reserved-button"\
                id="dropdown-reserved-button-' + index + '" data-toggle="dropdown" aria-haspopup="true"\
                aria-expanded="false">\
                <span id="dropdown-reserved-title-' + index + '">' + reservedUseDefaultArray[item.plan].name + '</span>\
            </a>\
            <div class="dropdown-menu" class="dropdown-menu-reserved"\
                aria-labelledby="dropdown-reserved-button-' + index + '">\
                <div id="dropdown-itemlist-' + index + '" value="' + item.plan + '"></div>\
            </div>\
        </div><br />' +
        i18n.__('task-reservation-cycle') +
        '<input type="number" id="reserved-cycle-' + index + '" class="reserved-cycle"\
            onchange="reservedEdit(' + index + ')" value="' + item.cycle + '"\
            oninput="value = value.replace(/[89e.-]+/g, \'\').slice(0, 7);"\
            style="ime-mode:Disabled" /><br />\
        <span id="deleter' + index + '"><a href="javascript:reservedErase(' + index + ')" class="work underlined">' + i18n.__('delete') + '</a></span></div><hr />\
        </li>'
    );

    reservedUseDefaultArray.forEach(function (defaultArrayItem, defaultArrayIndex, defaultArray) {
        $("#dropdown-itemlist-" + index).append("<a class='dropdown-item' value='" + defaultArrayIndex + "' href='javascript:reservedEditDropdownTrigger(" + index + ',' + defaultArrayIndex + ")' >" + defaultArrayItem.name + "</a>");
    });
}

function reservedErase(index) {
    reservedArray.splice(index, 1);
    store.set("reserved", reservedArray);
    store.set("reserved-cnt", store.get("reserved-cnt") - 1);
    $("#reserved-" + index).remove();
}

function reservedAdd() {
    reservedArray.push(newReservedItem);
    reservedListReorder();
    store.set("reserved-record", store.get("reserved-record") + 1);
    newReservedItem.id = store.get("reserved-record") + 1;
    store.set("reserved-cnt", store.get("reserved-cnt") + 1);
    reservedAppend(newReservedItem, reservedArray.length - 1);
    store.set("settings-goto", "locker");
    location.reload();
}

function reservedListReorder() {
    let newReservedArray = [];
    for (let i in reservedArray) {
        if (reservedArray[i].cycle.indexOf("0") !== -1) {
            newReservedArray.unshift(reservedArray[i]);
        } else {
            newReservedArray.push(reservedArray[i]);
        }
    }

    store.set("reserved", newReservedArray);
}

function reservedEditDropdownTrigger(index, val) {
    $("#dropdown-reserved-title-" + index).text(reservedUseDefaultArray[val].name);
    $("#dropdown-itemlist-" + index).attr("value", val);
    reservedEdit(index);
}

function reservedEdit(index) {
    reservedArray[index].time = $("#reserved-time-" + index).val();
    reservedArray[index].plan = $("#dropdown-itemlist-" + index).attr("value");
    reservedArray[index].cycle = $("#reserved-cycle-" + index).val();

    let planInfo = store.get("predefined-tasks")[reservedArray[index].plan];
    let planTotalTime = (planInfo.workTime + planInfo.restTime) * planInfo.loops;
    let endTimeHourPart = Number(reservedArray[index].time.slice(0, 2)) + Math.floor(planTotalTime / 60);
    let endTimeMinutePart = Number(reservedArray[index].time.slice(3, 5)) + planTotalTime % 60;
    if (endTimeMinutePart >= 60) endTimeMinutePart -= 60, endTimeHourPart += 1;
    if (endTimeHourPart >= 24) endTimeHourPart = 24, endTimeMinutePart = 0;
    endTimeHourPart = endTimeHourPart.toString(), endTimeMinutePart = endTimeMinutePart.toString();
    if (endTimeHourPart.length < 2) endTimeHourPart = "0" + endTimeHourPart;
    if (endTimeMinutePart.length < 2) endTimeMinutePart = "0" + endTimeMinutePart;
    reservedArray[index].endTime = endTimeHourPart + ":" + endTimeMinutePart;

    store.set("reserved", reservedArray);
}

function defaultPageSetting(val) {
    if (store.get('default-page') !== String(val)) {
        store.set("default-page", String(val));
        $("#default-page-dropdown-button").text(i18n.__('default-page-sel-' + String(val)));
    }
}

//other things
let hotkeyTo = "", keyDownGet = "";
let hotkeyList = store.get("hotkey");

for (let i in hotkeyList) {
    $("#hotkey-box").append("\
        <label id = \"hotkey-for-" + hotkeyList[i].name + "\" class= \"hotkey-set-label text-muted\" ></label>\
    <input id=\"hotkey-" + hotkeyList[i].name + "\" class=\"hotkey-set-input\" type=\"text\" maxlength=\"64\"\
        onclick=\"keyDownCapturer(\'" + hotkeyList[i].name + "\')\" onblur=\"keyDownTriggerRemover()\" /><br />");
    $("#hotkey-for-" + hotkeyList[i].name).text(i18n.__("hotkey-for-" + hotkeyList[i].name));
    $("#hotkey-" + hotkeyList[i].name).val(hotkeyList[i].value);
}

function keyDownCapturer(to) {
    hotkeyTo = to;
    document.addEventListener('keydown', KeyDownTrigger, false);
}

function isTagNude(tag) {
    return tag.indexOf('Control') === -1 && tag.indexOf('Shift') === -1
        && tag.indexOf('Alt') === -1 && tag.indexOf('Command') === -1 && tag.indexOf('Win') === -1;
}

function KeyDownTrigger(event) {
    event.preventDefault();
    keyDownGet = "";

    const keyName = event.key;

    if (keyName === 'Control' || keyName === 'Alt' || keyName === 'Shift' || keyName === 'Meta') return;

    if (event.metaKey) keyDownGet += (process.platform === "darwin") ? "Command + " : "";
    if (event.ctrlKey) keyDownGet += "Control + ";
    if (event.altKey) keyDownGet += "Alt + ";
    if (event.shiftKey) keyDownGet += "Shift + ";
    if (keyName) keyDownGet += keyName.toUpperCase();
    if (keyName.indexOf("Unidentified") === -1 && keyName.indexOf("Dead") === -1 && keyName.indexOf("PROCESS") === -1) {
        if (isTagNude(keyDownGet)) keyDownGet = cmdOrCtrl._('long', 'pascal') + " + Shift + Alt + " + keyDownGet;
        $("#hotkey-" + hotkeyTo).val(keyDownGet);
        ipc.send("global-shortcut-set", {
            type: hotkeyTo,
            before: store.get("hotkey." + hotkeyTo).value,
            to: keyDownGet
        });
    } else keyDownGet = "";
}

function keyDownTriggerRemover() {
    document.removeEventListener('keydown', KeyDownTrigger, false);
}

let aes = require("crypto-js/aes");
let encoding = require("crypto-js/enc-utf8");
let copyToClipboard = require("copy-to-clipboard");
if (process.env.NODE_ENV === "portable") {
    statistics = new Store({
        cwd: require('@electron/remote').app.getPath('exe').replace("wnr.exe", ""),
        name: 'wnr-statistics'
    });
} else {
    statistics = new Store({ name: 'statistics' });
}

function settingsBackup(mode) {
    let cipherText = aes.encrypt(JSON.stringify((mode === "statistics") ? statistics.store : store.store), (mode === "statistics") ? String("She's awesome.") : String("We all love wnr, so please do not use this passcode to do bad things."));
    copyToClipboard(cipherText.toString());
    ipc.send("notify", i18n.__('copied'));
}

function settingsImport(token, mode) {
    let bytes = aes.decrypt(token, (mode === "statistics") ? String("She's awesome.") : String("We all love wnr, so please do not use this passcode to do bad things."));
    let isAllRight = true, formerData = null;
    try {
        let decryptedData = JSON.parse(bytes.toString(encoding));
        if (mode === "statistics") {
            formerData = statistics.store;
            statistics.clear();
            statistics.set(decryptedData);
        } else {
            formerData = store.store;
            store.clear();
            store.set(decryptedData);
        }
    } catch (error) {
        ipc.send("alert", i18n.__('settings-import-error'))
        isAllRight = false;
        clearTimeout(importTimeout);
        if (mode === "statistics") statistics.set(formerData);
        else store.set(formerData);
    }
    importTimeout = setTimeout(function () {
        if (isAllRight) call('relauncher');
    }, 1000);
}

//personalization

function personalizedNotification() {
    $(".personalization-notification").each(function () {
        if ($(this).val() && $(this).val() !== "")
            store.set("personalization-notification." + $(this).attr("name"), $(this).val());
        else store.delete("personalization-notification." + $(this).attr("name"));
    });
}

let player = document.createElement("audio");//alert player
let soundList = ['alarming', 'beep', 'clock', 'tick', 'trumpet', 'whistle', 'horns', 'magic', 'piano'];
for (let i in soundList) {
    $("#work-time-end-sound-select").append("\
            <a class='dropdown-item' href='javascript:workTimeEndSoundSetting(\"" + soundList[i] + "\")'>"
        + soundList[i] + "</a>");
}
$("#work-time-end-sound-dropdown-button").text(store.has("time-end-sound") ? store.get("time-end-sound") : "tick");

function workTimeEndSoundSetting(val) {
    try {
        store.set("time-end-sound", val);
        $("#work-time-end-sound-dropdown-button").text(val);
        player.src = path.join(__dirname, "\\res\\sound\\" + val + ".mp3");
        player.loop = false;
        player.play();
    } catch (e) {
        console.log(e);
    }
}

for (let i in soundList) {
    $("#all-time-end-sound-select").append("\
            <a class='dropdown-item' href='javascript:allTimeEndSoundSetting(\"" + soundList[i] + "\")'>"
        + soundList[i] + "</a>");
}
$("#all-time-end-sound-dropdown-button").text(store.has("all-end-sound") ? store.get("all-end-sound") : "piano");

function allTimeEndSoundSetting(val) {
    try {
        store.set("all-end-sound", val);
        $("#all-time-end-sound-dropdown-button").text(val);
        player.src = path.join(__dirname, "\\res\\sound\\" + val + ".mp3");
        player.loop = false;
        player.play();
    } catch (e) {
        console.log(e);
    }
}

if (store.get("dark-or-white") === "light") $("#white-or-dark-dropdown-button").html(i18n.__('personalization-white-or-dark-mode-white'));
else if (store.get("dark-or-white") === "dark") $("#white-or-dark-dropdown-button").html(i18n.__('personalization-white-or-dark-mode-dark'));
else $("#white-or-dark-dropdown-button").html(i18n.__('personalization-white-or-dark-mode-auto'));

function darkOrWhiteSetting(val) {
    if (store.get('dark-or-white') !== val) {
        if (val === "auto") store.delete("dark-or-white");
        else store.set("dark-or-white", val);
        timeOut = setTimeout("call('relauncher')", 500);
    }
}