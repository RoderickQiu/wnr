var timeOut = null;//temporary variable

//settings page router
settingsGoto(store.get("settings-goto"));
function settingsGoto(mask) {
    if (mask == "locker") {
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
    } else if ((mask == "predefined-tasks" || mask == "" || mask == null) && (!store.get('islocked'))) {
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
    } else if (mask == "languages" && (!store.get('islocked'))) {
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
    } else if ((mask == "global-settings" || mask == "normal") && (!store.get('islocked'))) {
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
    } else if (mask == "other-things" && (!store.get('islocked'))) {
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
    } else if (mask == "personalization" && (!store.get('islocked'))) {
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
let newItem = {
    name: "new item",
    workTime: 30,
    restTime: 10,
    loops: 4,
    focusWhenWorking: false,
    focusWhenResting: false
};
defaultArray.forEach(function (item, index, array) {
    append(item, index);
});
if (store.has("default-task")) setAsDefault(store.get("default-task"));
function edit(index) {
    defaultArray[index].name = $("#title" + index).val();
    if (Number($("#work-time" + index).val()) != NaN && Number($("#work-time" + index).val()) >= 2) defaultArray[index].workTime = $("#work-time" + index).val();
    else $("#work-time" + index).val(defaultArray[index].workTime);
    if (Number($("#rest-time" + index).val()) != NaN && Number($("#rest-time" + index).val()) >= 2) defaultArray[index].restTime = $("#rest-time" + index).val();
    else $("#rest-time" + index).val(defaultArray[index].restTime);
    if (Number($("#loops" + index).val()) != NaN && Number($("#loops" + index).val()) >= 1) defaultArray[index].loops = $("#loops" + index).val();
    else $("#loops" + index).val(defaultArray[index].loops);
    if (document.getElementById("focus-when-working" + index).checked) defaultArray[index].focusWhenWorking = true;
    else defaultArray[index].focusWhenWorking = false;
    if (document.getElementById("focus-when-resting" + index).checked) defaultArray[index].focusWhenResting = true;
    else defaultArray[index].focusWhenResting = false;
    store.set("predefined-tasks", defaultArray);
}
function append(item, index) {
    $("#itemlist-ul").append(
        "<li id='item" + index + "'> <input name='title' id='title" + index + "' type='text' class='lead rest' maxlength='15' value='" +
        item.name + "'onchange='edit(" + index + ")' /> <br /><div class='text-muted small'>" +
        i18n.__('predefined-tasks-settings-tip-part-1') + " <input id='work-time" + index + "' class='hotkeyset' type='number' value='" +
        item.workTime + "'onchange='edit(" + index + ")' oninput='if (value.length > 2) value = value.slice(0, 2)' style='ime-mode:Disabled' /> " +
        i18n.__('min') +
        i18n.__('predefined-tasks-settings-tip-part-2') + " <input id='rest-time" + index + "' class='hotkeyset' type='number' value='" +
        item.restTime + "'onchange='edit(" + index + ")' oninput='if (value.length > 2) value = value.slice(0, 2)' style='ime-mode:Disabled' /> " +
        i18n.__('min') +
        i18n.__('predefined-tasks-settings-tip-part-3') + " <input id='loops" + index + "' class='hotkeyset' type='number' value='" +
        item.loops + "'onchange='edit(" + index + ")' oninput='if (value.length > 2) value = value.slice(0, 2)' style='ime-mode:Disabled' /> " +
        i18n.__('time(s)') +
        "<br />" + i18n.__('focus-when-working') + " <input id='focus-when-working" + index + "' type='checkbox' onchange='edit(" + index + ")' />&nbsp;&nbsp;|&nbsp;" +
        i18n.__('focus-when-resting') + " <input id='focus-when-resting" + index + "' type='checkbox' onchange='edit(" + index + ")' />\
                <br /><span id='set-as-default-task-container" + index + "'><a class='rest underlined' href='javascript:setAsDefault(" + index + ")'>" + i18n.__('set-as-default-task') + "</a> | </span>\
                <span id='deleter" + index + "'><a href='javascript:erase(" + index + ")' class='work underlined'>" + i18n.__('delete') + "</a></span>\
                </div><hr /></li>"
    );
    if (item.focusWhenWorking) document.getElementById("focus-when-working" + index).checked = true;
    else document.getElementById("focus-when-working" + index).checked = false;
    if (item.focusWhenResting) document.getElementById("focus-when-resting" + index).checked = true;
    else document.getElementById("focus-when-resting" + index).checked = false;
}
function erase(index) {
    defaultArray.splice(index, 1);
    store.set("predefined-tasks", defaultArray);
    $("#item" + index).remove();
}
function add() {
    defaultArray.push(newItem);
    store.set("predefined-tasks", defaultArray);
    append(newItem, defaultArray.length - 1);
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
    if (store.get("i18n") == languageList[i]) {
        $("#language-dropdown-button").text(languageNameList[i]);
    }
}
function languageSetting(val) {
    if (store.get('i18n') != val) {
        store.set("i18n", val);
        timeOut = setTimeout("call('relauncher')", 500);
    }
}

//global settings
if (store.get("sound") != undefined) {
    if (store.get("sound")) document.getElementById("notifying-sound-setting").checked = true;
    else document.getElementById("notifying-sound-setting").checked = false;
}
function notifyingSoundSetting() {
    if (document.getElementById("notifying-sound-setting").checked == true) store.set("sound", true);
    else store.set("sound", false);
}
if (store.get("top") != undefined) {
    if (store.get("top") == true) document.getElementById("always-on-top-setting").checked = true;
    else document.getElementById("always-on-top-setting").checked = false;
}
function alwaysOnTopSetting() {
    if (document.getElementById("always-on-top-setting").checked == true) store.set("top", true);
    else store.set("top", false);
    timeOut = setTimeout("call('relauncher')", 500);
}
var AutoLaunch = require('auto-launch');
var wnrLauncher = new AutoLaunch({ name: 'wnr' });
wnrLauncher.isEnabled()
    .then(function (isEnabled) {
        if (isEnabled) {
            document.getElementById("auto-start-setting").checked = true;
        } else {
            document.getElementById("auto-start-setting").checked = false;
        }
    }).catch(function (error) {
        ipc.send("alert", i18n.__('without-permission-part-1') + ((process.platform == "darwin") ? i18n.__('without-permission-part-2') : ""));
    })
function autoStartSetting() {
    if (document.getElementById("auto-start-setting").checked == true) {
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
                ipc.send("alert", i18n.__('without-permission-part-1') + ((process.platform == "darwin") ? i18n.__('without-permission-part-2') : ""));
            })
    }
    else {
        store.set("autostart", false);
        wnrLauncher.isEnabled()
            .then(function (isEnabled) {
                if (isEnabled) {
                    wnrLauncher.disable();
                }
                return;
            }).catch(function (error) {
                store.set("autostart", true);
                document.getElementById("auto-start-setting").checked = true;
                ipc.send("alert", i18n.__('without-permission-part-1') + ((process.platform == "darwin") ? i18n.__('without-permission-part-2') : ""));
            })
    }
}
if (store.get("autocheck") != false) document.getElementById("auto-check-update-setting").checked = true;
else document.getElementById("auto-check-update-setting").checked = false;
function autoCheckSetting() {
    if (document.getElementById("auto-check-update-setting").checked == true) store.set("autocheck", true);
    else store.set("autocheck", false);
}
if (store.get("alarmtip") != false) document.getElementById("alarm-for-not-using-wnr-dialog-box-title-setting").checked = true;
else document.getElementById("alarm-for-not-using-wnr-dialog-box-title-setting").checked = false;
function alarmForNotUsingSetting() {
    if (document.getElementById("alarm-for-not-using-wnr-dialog-box-title-setting").checked == true) store.set("alarmtip", true);
    else store.set("alarmtip", false);
}
if (store.get("onemintip") != false) document.getElementById("one-min-left-notification-setting").checked = true;
else document.getElementById("one-min-left-notification-setting").checked = false;
function oneMinLeftNotificationSetting() {
    if (document.getElementById("one-min-left-notification-setting").checked == true) store.set("onemintip", true);
    else store.set("onemintip", false);
}
if (store.get("autostarttask") == true) document.getElementById("auto-start-task-setting").checked = true;
else document.getElementById("auto-start-task-setting").checked = false;
function autoStartDefaultTaskSetting() {
    if (document.getElementById("auto-start-task-setting").checked == true) store.set("autostarttask", true);
    else store.set("autostarttask", false);
}
if (store.get("localtime") != false) document.getElementById("local-time-setting").checked = true;
else document.getElementById("local-time-setting").checked = false;
function localTimeSetting() {
    if (document.getElementById("local-time-setting").checked != false) store.set("localtime", true);
    else store.set("localtime", false);
}
if (store.get("infinity") == true) document.getElementById("infinity-mode-setting").checked = true;
else document.getElementById("infinity-mode-setting").checked = false;
function infinityModeSetting() {
    if (document.getElementById("infinity-mode-setting").checked == true) store.set("infinity", true);
    else store.set("infinity", false);
}
if (store.get("dock-hide") == true) document.getElementById("hide-from-dock-setting").checked = true;
else document.getElementById("hide-from-dock-setting").checked = false;
function hideFromDockSetting() {
    if (document.getElementById("hide-from-dock-setting").checked == true) store.set("dock-hide", true);
    else store.set("dock-hide", false);
    timeOut = setTimeout("call('relauncher')", 500);
}
if (store.get("nap") == true) document.getElementById("nap-setting").checked = true;
else {
    document.getElementById("nap-setting").checked = false;
    $("#nap-time-set").css("display", "none");
}
if (store.has("nap-time")) $("#nap-time-msg").val(store.get("nap-time"));
else $("#nap-time-msg").val(10);
function napSetting() {
    if (document.getElementById("nap-setting").checked == true) {
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
if (store.get("loose-mode") == true) document.getElementById("loose-setting").checked = true;
else document.getElementById("loose-setting").checked = false;
function looseSetting() {
    if (document.getElementById("loose-setting").checked == true) store.set("loose-mode", true);
    else store.set("loose-mode", false);
}
if (store.get("no-check-time-end") == true) document.getElementById("check-after-time-end-setting").checked = false;
else document.getElementById("check-after-time-end-setting").checked = true;
function checkAfterTimeEndSetting() {
    if (document.getElementById("check-after-time-end-setting").checked == true) store.set("no-check-time-end", false);
    else store.set("no-check-time-end", true);
}
if (store.get("disable-pausing") == true) document.getElementById("disable-pausing-setting").checked = true;
else document.getElementById("disable-pausing-setting").checked = false;
function disablePausingSetting() {
    if (document.getElementById("disable-pausing-setting").checked == true) store.set("disable-pausing", true);
    else store.set("disable-pausing", false);
}
if (store.get("should-stop-locked") == true) document.getElementById("still-count-setting").checked = true;
else document.getElementById("still-count-setting").checked = false;
function stillCountSetting() {
    if (document.getElementById("still-count-setting").checked == true) store.set("should-stop-locked", true);
    else store.set("should-stop-locked", false);
}

//lock mode settings
function lock(passcode, again) {
    var md5 = require('crypto-js/md5');
    if (passcode == "" || again == "") ipc.send("locker-passcode", 'empty');
    else
        if (!store.get('islocked')) {
            if (passcode == again) {
                store.set('lockerpasscode', md5(passcode).toString());
                store.set('islocked', true);
                ipc.send("locker-passcode", 'lock-mode-on');
                window.close();
            } else ipc.send("locker-passcode", 'not-same-password');
        } else {
            if (passcode == again) {
                if (passcode == store.get('lockerpasscode') || md5(passcode).toString() == store.get('lockerpasscode')) {
                    store.set('islocked', false);
                    ipc.send("locker-passcode", 'lock-mode-off');
                    window.close();
                } else ipc.send("locker-passcode", 'wrong-passcode');
            } else ipc.send("locker-passcode", 'not-same-password');
        }
}

//other things
let hotkeyTo = "", keyDownGet = "";;
$("#hotkey-1").val(store.get("hotkey1"));
$("#hotkey-2").val(store.get("hotkey2"));
function keyDownCapturer(to) {
    hotkeyTo = to;
    document.addEventListener('keydown', KeyDownTrigger, false);
}

function isTagNude(tag) {
    if (tag.indexOf('Control') == -1 && tag.indexOf('Shift') == -1
        && tag.indexOf('Alt') == -1 && tag.indexOf('Command') == -1 && tag.indexOf('Win') == -1)
        return true;
    else return false;
}

function KeyDownTrigger(event) {
    event.preventDefault();
    keyDownGet = "";

    const keyName = event.key;

    if (keyName === 'Control' || keyName === 'Alt' || keyName === 'Shift' || keyName === 'Meta') return;

    if (event.metaKey) keyDownGet += (process.platform == "darwin") ? "Command + " : "";
    if (event.ctrlKey) keyDownGet += "Control + ";
    if (event.shiftKey) keyDownGet += "Shift + ";
    if (event.altKey) keyDownGet += "Alt + ";
    if (keyName) keyDownGet += keyName.toUpperCase();
    if (keyName.indexOf("Unidentified") == -1 && keyName.indexOf("Dead") == -1 && keyName.indexOf("PROCESS") == -1) {
        if (isTagNude(keyDownGet)) keyDownGet = cmdOrCtrl._('long', 'pascal') + " + Shift + Alt + " + keyDownGet;
        $("#hotkey-" + hotkeyTo).val(keyDownGet);
        ipc.send("global-shortcut-set", { type: hotkeyTo, before: store.get("hotkey" + hotkeyTo), to: keyDownGet });
    } else keyDownGet = "";
}

function keyDownTriggerRemover() {
    document.removeEventListener('keydown', KeyDownTrigger, false);
}

var aes = require("crypto-js/aes");
var encoding = require("crypto-js/enc-utf8");
var copyToClipboard = require("copy-to-clipboard");
if (process.env.NODE_ENV == "portable") {
    statistics = new Store({ cwd: require("electron").remote.app.getPath('exe').replace("wnr.exe", ""), name: 'wnr-statistics' });
} else {
    statistics = new Store({ name: 'statistics' });
}
function settingsBackup(mode) {
    var cipherText = aes.encrypt(JSON.stringify((mode == "statistics") ? statistics.store : store.store), (mode == "statistics") ? String("She's awesome.") : String("We all love wnr, so please do not use this passcode to do bad things."));
    copyToClipboard(cipherText.toString());
    ipc.send("notify", i18n.__('copied'));
}
function settingsImport(token, mode) {
    var bytes = aes.decrypt(token, (mode == "statistics") ? String("She's awesome.") : String("We all love wnr, so please do not use this passcode to do bad things."));
    var isAllRight = true, formerData = null, importTimeout = null;
    try {
        var decryptedData = JSON.parse(bytes.toString(encoding));
        if (mode == "statistics") {
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
        if (importTimeout != null) clearTimeout(importTimeout);
        if (mode == "statistics") statistics.set(formerData);
        else store.set(formerData);
    }
    importTimeout = setTimeout(function () {
        if (isAllRight) call('relauncher');
    }, 1000);
}

//personalization

function personalizedNotification() {
    $(".personalization-notification").each(function () {
        if ($(this).val() && $(this).val() != "")
            store.set("personalization-notification." + $(this).attr("name"), $(this).val());
        else store.delete("personalization-notification." + $(this).attr("name"));
    });
}

var player = document.createElement("audio");//alert player
let soundList = ['alarming', 'beep', 'clock', 'tick', 'trumpet', 'whistle', 'horns', 'magic', 'piano'];
for (i in soundList) {
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

for (i in soundList) {
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

if (store.get("dark-or-white") == "light") $("#white-or-dark-dropdown-button").html(i18n.__('personalization-white-or-dark-mode-white'));
else if (store.get("dark-or-white") == "dark") $("#white-or-dark-dropdown-button").html(i18n.__('personalization-white-or-dark-mode-dark'));
else $("#white-or-dark-dropdown-button").html(i18n.__('personalization-white-or-dark-mode-auto'));
function darkOrWhiteSetting(val) {
    if (store.get('dark-or-white') != val) {
        if (val == "auto") store.delete("dark-or-white");
        else store.set("dark-or-white", val);
        timeOut = setTimeout("call('relauncher')", 500);
    }
}