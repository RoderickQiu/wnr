function preferenceCreator(items, container, inner) {
    for (let i = 0; i < items.length; i++) {
        switch (items[i].type) {
            case "title":
                titleSolution(items[i], container);
                break;
            case "selection":
                selectionSoluion(items[i], container, inner);
                break;
            case "dropdown":
                dropdownSolution(items[i], container);
                break;
            case "collapse":
                collapseSolution(items[i], container);
                break;
            default:
                customSolution(items[i].type, container);
                break;
        }
    }
}

function titleSolution(obj, parent) {
    let id = obj.id;
    parent.append(`
    <div class="row w-100 align-items-center">
        <div class="col-12">
            <small class="text-grey">${ i18n.__(id) }</small>
        </div>
    </div>
    <br />
    `);
}

function collapseSolution(obj, parent) {
    let
        id = obj.id,
        tipped = (typeof (obj.tipped) == "undefined") ? true : obj.tipped;
    parent.append(`
    <div class="row w-100 align-items-center">
            <div class="col-9 text-left">
                <label>
                    ${ i18n.__(id) }
                </label>
                <br />
                <p class="settings-msg">
                ${ tipped ? i18n.__(id + '-tip') : "" }
                </p>
            </div>
            <div class="col-3 text-right">
                <a class="btn btn-sm btn-outline-primary dropdown-toggle" data-toggle="collapse" href="#collapsed-${ id }" role="button"
                   aria-expanded="false" aria-controls="collapse-${ id }" id="collapse-toggle-${ id }">
                    ${ i18n.__("unfold") }
                </a>
            </div>
            <div class="collapse col-12 pt-2" id="collapsed-${ id }">
                <div class="card card-body" id="collapse-container-${ id }"></div>
            </div>
        </div>
        <br/>
    `);
    let collapseToggle = $("#collapse-toggle-" + id);
    collapseToggle.on('click', function () {
        if (collapseToggle.text().indexOf(i18n.__("unfold")) !== -1)
            collapseToggle.text(i18n.__("fold") + " ");
        else
            collapseToggle.text(i18n.__("unfold") + " ");
    })
    preferenceCreator(obj.inner, $("#collapse-container-" + id), true);
}

/*
    e.g.
    type: dropdown
    id: [whether-enable]-pausing //change its form
    choices: [always, work, rest, never]
    def: 0 //always needed, different from selections
    tipped: false //when true, not needed
    relaunch: true //when false, not needed
 */
function dropdownSolution(obj, parent) {
    let
        id = obj.id,
        def = obj.def,
        choices = obj.choices,
        tipped = (typeof (obj.tipped) == "undefined") ? true : obj.tipped,
        relaunch = (typeof (obj.relaunch) == "undefined") ? false : obj.relaunch,
        after = (typeof (obj.after) === "undefined") ? (function () {
        }) : obj.after;
    parent.append(`
        <div class="row w-100 align-items-center">
            <div class="col-8 text-left">
                <label>
                    ${ i18n.__(id) }
                </label>
                <p class="settings-msg${ tipped ? '' : ' d-none' }">
                    ${ tipped ? i18n.__(id + '-tip') : "" }
                </p>
            </div>
            <div class="col-4 text-right">
                <div class="dropdown d-inline">
                    <a aria-expanded="false" aria-haspopup="true"
                       class="btn btn-outline-secondary dropdown-toggle w-100 small" data-toggle="dropdown"
                       id="dropdown-button-${ id }">
                    </a>
                    <div aria-labelledby="dropdown-button-${ id }" class="dropdown-menu"
                         id="dropdown-${ id }">
                    </div>
                </div>
            </div>
        </div>
        <br/>
    `);
    for (let i in choices) {
        $('#dropdown-' + id).append(`
            <a class='dropdown-item' href="javascript:dropdownTrigger('${ id }',${ i }, '${ i18n.__('dropdown-' + choices[i]) }',${ relaunch },${ after })">
                ${ i18n.__('dropdown-' + choices[i]) }
            </a>
        `);
    }
    if (!store.has(id)) $('#dropdown-button-' + id).html(i18n.__('dropdown-' + choices[def]));
    else $('#dropdown-button-' + id).html(i18n.__('dropdown-' + choices[store.get(id)]));
}

function dropdownTrigger(id, choiceId, choiceMsg, relaunch, after) {
    $('#dropdown-button-' + id).html(choiceMsg);
    store.set(id, choiceId);
    after(choiceId);//do after execution jobs
    if (relaunch) ipc.send("relaunch-dialog");
}

/*
    e.g.
    type: selection
    id: autocheck
    def: true //when false, not needed
    tipped: false //when true, not needed
*/
function selectionSoluion(obj, parent, inner) {
    let
        id = obj.id,
        def = (typeof (obj.def) == "undefined") ? false : obj.def,
        tipped = (typeof (obj.tipped) == "undefined") ? true : obj.tipped,
        relaunch = (typeof (obj.relaunch) == "undefined") ? false : obj.relaunch,
        after = (typeof (obj.after) === "undefined") ? (function () {
        }) : obj.after;
    if (process.platform !== "darwin" && id === "dock-hide") return;//for Win and Linux, don't show this section
    if (process.platform === "darwin" && id === "force-screen-lock-mode") return;//for macOS, don't show this section
    parent.append(`
        <div class="row w-100 align-items-center">
            <div class="col-${ inner ? 8 : 9 } text-left">
                <label>
                    ${ i18n.__(id) }
                </label>
                <br/>
                <p class="settings-msg${ tipped ? '' : ' d-none' }" id="msg-${ id }">
                    ${ tipped ? i18n.__(id + '-tip') : "" }
                </p>
            </div>
            <div class="col-${ inner ? 4 : 3 } text-right">
                <label class="switch-slide">
                    <input type="checkbox" id="selection-${ id }" hidden>
                    <label for="selection-${ id }" class="switch-slide-label"></label>
                </label>
            </div>
        </div>
        <br/>
    `);
    let selection = $('#selection-' + id);
    if ((def && !store.has(id)) || store.get(id) === true)
        selection.prop("checked", true);
    if (!tipped) $('#msg-' + id).remove();
    selection.on("click", function () {
        store.set(id, $('#selection-' + id).prop("checked"));
        after($('#selection-' + id).prop("checked"));//do after execution jobs
        if (relaunch) ipc.send("relaunch-dialog");
    });
}

function customSolution(type, parent) {
    let appendDOMString = ``;
    switch (type) {
        case "open-notification-settings":
            appendDOMString = `
        <div class="row w-100">
            <div class="col-9 text-left">
                <label>${ i18n.__("open-notification-settings") }</label>
                <br />
            </div>
            <div class="col-3 text-right">
                <a class="btn btn-sm btn-outline-primary" href="javascript:call('open-notification-settings')">
                    ${ i18n.__("go") }
                </a>
            </div>
        </div>
        <br />
            `;
            break;
        case "autocheck":
            appendDOMString = `
            <div class="row w-100 align-items-center">
            <div class="col-9 text-left">
                <label>${ i18n.__("autocheck") }</label><br/>
                <p class="settings-msg">
                    <a class="rest underlined" href="javascript:updateChecker(2)">
                        <span id="manually">
                        ${ i18n.__('manually-check-for-update') }
                        </span>
                    </a>&nbsp;
                    ${ i18n.__('manually-check-for-update-tip-1') + i18n.__('v') + require("./package.json").version + i18n.__('manually-check-for-update-tip-2') }
                </p>
            </div>
            <div class="col-3 text-right">
                <label class="switch-slide">
                    <input type="checkbox" id="selection-autocheck" hidden
                    onclick="store.set('autocheck', $('#selection-autocheck').prop('checked'))">
                    <label for="selection-autocheck" class="switch-slide-label"></label>
                </label>
            </div>
        </div>
        <br/>`;
            break;
        case "predefined":
            appendDOMString = `
            <div class="w-100 row">
            <div class="should-lock col-12" id="predefined-tasks">
                <div class="align-content-center form-text">
                    <div class="d-flex text-left">
                        <div id="itemlist">
                            <ul id="itemlist-ul"></ul>
                        </div>
                        <br /><br />
                    </div>
                    <div class="align-self-start text-left small">
                        <a class="text-info underlined" href="javascript:planAdd()">
                            ${ i18n.__('add') }
                        </a><br/>
                        <span class="text-muted small">
                            ${ i18n.__('task-reservation-settings-tip-part1') }
                        </span>
                    </div>
                </div>
            </div>
            </div>
            <br/>
            `;
            break;
        case "task-reservation":
            appendDOMString = `
            <div class="w-100 row">
            <div class="col-12 small text-muted">
                <ul class="text-muted${ (store.has("reserved") && store.get("reserved").toString() !== "") ? '' : ' d-none' }" id="reservation-list"></ul>
                <div class="align-self-start text-left">
                    <a class="text-info underlined" href="javascript:reservedAdd()">
                        ${ i18n.__('add') }
                    </a>
                </div>
                <div class="text-muted small">
                    ${ i18n.__('task-reservation-settings-tip-part1') }<br/>
                    ${ (store.has("reserved") && store.get("reserved").toString() !== "") ?
                ('<br />' + i18n.__('task-reservation-settings-tip-part2') + '<br />' + i18n.__('task-reservation-settings-tip-part3'))
                : "" }
                </>
            </div></div></div>
            <br/>`;
            break;
        case "personalization-notification":
            appendDOMString = `
            <div class="w-100 row">
            <div class="col-5">
            <label class="personalization-notification-label settings-msg settings-msg text-muted" id="work-time-end"></label>
            </div>
            <div class="col-7 text-right">
            <input class="personalization-notification" maxlength="64" name="work-time-end"
                   onchange="personalizedNotification()"
                   type="text" />
            </div>
            <div class="col-5">
            <label class="personalization-notification-label settings-msg settings-msg text-muted"
                         id="work-time-end-msg"></label>
            </div>
            <div class="col-7 text-right">             
            <input class="personalization-notification" maxlength="64" name="work-time-end-msg"
                   onchange="personalizedNotification()"
                   type="text" />
            </div>
            <div class="col-5">
            <label class="personalization-notification-label settings-msg text-muted" id="rest-time-end"></label>
            </div>
            <div class="col-7 text-right">  
            <input class="personalization-notification" maxlength="64" name="rest-time-end"
                   onchange="personalizedNotification()"
                   type="text" />
            </div>
            <div class="col-5">
            <label class="personalization-notification-label settings-msg text-muted" id="rest-time-end-msg"></label>
            </div>
            <div class="col-7 text-right">  
            <input class="personalization-notification" maxlength="64" name="rest-time-end-msg"
                   onchange="personalizedNotification()"
                   type="text" />
            </div>
            <div class="col-5">  
            <label class="personalization-notification-label settings-msg text-muted" id="all-task-end"></label>
            </div>
            <div class="col-7 text-right">  
            <input class="personalization-notification" maxlength="64" name="all-task-end"
                   onchange="personalizedNotification()"
                   type="text" />
            </div>
            <div class="col-5"> 
            <label class="personalization-notification-label settings-msg text-muted" id="all-task-end-msg"></label> 
            </div>
            <div class="col-7 text-right"> 
            <input class="personalization-notification" maxlength="64" name="all-task-end-msg"
                   onchange="personalizedNotification()"
                   type="text" />
            </div>
            <script>
                $(".personalization-notification").each(function () {
                    $(this).attr("placeholder", i18n.__($(this).attr("name")));
                    if (store.has("personalization-notification." + $(this).attr("name")))
                        $(this).val(store.get("personalization-notification." + $(this).attr("name")));
                });
                $(".personalization-notification-label").each(function () {
                    $(this).text(i18n.__('personalization-notification-label-begin') +
                            i18n.__($(this).attr("id")) + i18n.__('personalization-notification-label-end'));
                });
            </script>
            </div><br/>`;
            break;
        case "personalization-notify-sound":
            appendDOMString = `
            <div class="w-100 row align-items-center">
            <div class="col-7">
            <label>
                ${ i18n.__("personalization-notify-sound-msg-time-end") }
            </label>
            </div>
            <div class="col-5 text-right">
            <div class="dropdown">
                <a aria-expanded="false"
                   aria-haspopup="true" class="btn btn-outline-secondary dropdown-toggle"
                   data-toggle="dropdown"
                   id="work-time-end-sound-dropdown-button">
                </a>
                <div aria-labelledby="work-time-end-sound-dropdown-button" class="dropdown-menu"
                     id="work-time-end-sound-select">
                </div>
            </div><br/>
            </div>
            <div class="col-7">
            <label>
                ${ i18n.__("personalization-notify-sound-msg-all-end") }
            </label>
            </div>
            <div class="col-5 text-right">
            <div class="dropdown">
                <a aria-expanded="false" aria-haspopup="true"
                   class="btn btn-outline-secondary dropdown-toggle" data-toggle="dropdown"
                   id="all-time-end-sound-dropdown-button">
                </a>
                <div aria-labelledby="all-time-end-sound-dropdown-button" class="dropdown-menu"
                     id="all-time-end-sound-select">
                </div>
            </div><br/>
            </div>
            </div><br/>`;
            break;
        case "i18n":
            appendDOMString = `
            <div class="row w-100 align-items-center">
            <div class="col-8 text-left">
                <label>
                    ${ i18n.__('languages') }
                </label>
                <br/>
                <p class="settings-msg">
                    ${ i18n.__('language-contribute-tip-part-1') }
                        <a href=\"javascript:require('electron').shell.openExternal('https://github.com/RoderickQiu/wnr/blob/master/locales/README.md')\">${ i18n.__('language-contribute-tip-part-2') }</a>
                        ${ i18n.__('feedback-tip-part-4') }
                </p>
            </div>
            <div class="col-4 text-right">
                <div class="dropdown d-inline">
                    <a aria-expanded="false" aria-haspopup="true"
                       class="btn btn-outline-secondary dropdown-toggle w-100 small" data-toggle="dropdown"
                       id="language-dropdown-button">
                    </a>
                    <div aria-labelledby="language-dropdown-button" class="dropdown-menu" id="i18n">
                    </div>
                </div>
            </div></div>
            <br/>`;
            break;
        case "hotkey":
            appendDOMString = `
            <div id="hotkey-box" class="row w-100"></div>
            <br/>`;
            break;
        case "data-management":
            appendDOMString = `
            <ul>
            <li>
                ${ i18n.__('delete-all-data-msg') }
                <p class="small text-muted">
                    <a class="rest underlined" href="javascript:call('delete-all-data')">
                        ${ i18n.__('delete-all-data') + i18n.__('period-symbol') }
                    </a>&nbsp;
                </p>
            </li>
            <!-- settings backup -->
            <li>
                ${ i18n.__('settings-backup-msg') }
                <p class="small text-muted">
                    <a class="rest underlined" href="javascript:settingsBackup('settings')">
                        ${ i18n.__('copy') + i18n.__('period-symbol') }
                    </a>&nbsp;
                    ${ i18n.__('settings-backup-tip') }
                </p>
            </li>
            <!-- settings import -->
            <li>
                ${ i18n.__('settings-import-msg') }
                <br />
                <input id="settings-import-input" name="settings-import-input"
                       onkeydown="if(event.keyCode === 13) settingsImport($('#settings-import-input').val(),'settings');"
                       type="password" />
                <script> $('#settings-import-input').attr('placeholder', i18n.__('settings-import'));</script>
                <p class="small text-muted">
                    ${ i18n.__('settings-import-tip') }
                </p>
            </li>
            <!-- statistics backup -->
            <li>
                ${ i18n.__('statistics-backup-msg') }
                <p class="small text-muted">
                    <a class="rest underlined" href="javascript:settingsBackup('statistics')">
                        ${ i18n.__('copy') + i18n.__('period-symbol') }
                    </a>&nbsp;
                    ${ i18n.__('statistics-backup-tip') }
                </p>
            </li>
            <!-- statistics import -->
            <li>
                ${ i18n.__('statistics-import-msg') }
                <br />
                <input id="statistics-import-input" name="statistics-import-input"
                       onkeydown="if(event.keyCode === 13) settingsImport($('#statistics-import-input').val(),'statistics');"
                       type="password" />
                <script> $('#statistics-import-input').attr('placeholder', i18n.__('statistics-import'));</script>
                <p class="small text-muted">
                    ${ i18n.__('statistics-import-tip') }
                </p>
            </li>
            </ul><br/>`;
            break;
        case "locker":
            appendDOMString = `
            <div class="w-100 row align-items-center">
            <div class="col-12">
            <small class="text-grey">
                ${ i18n.__('locker-now-status') }<span class="font-weight-bold rest">
                ${ store.get('islocked') ? i18n.__('on') : i18n.__('off') } </span> ${ i18n.__('period-symbol') }
            </small><br /><br/>
            <input id="passcode-locker" maxlength="11" name="passcode-locker"
            onkeydown="if(event.keyCode === 13) lock($('#passcode-locker').val(), $('#passcode-locker-again').val());"
            type="password" />
            <br />
            <input id="passcode-locker-again" maxlength="11" name="passcode-locker-again"
            onkeydown="if(event.keyCode === 13) lock($('#passcode-locker').val(), $('#passcode-locker-again').val());"
            type="password" />
            <br /><br/>
            <div class="text-muted small">
            ${ store.get('islocked') ? i18n.__('locker-settings-input-tip-lock-mode-on') : i18n.__('locker-settings-input-tip-lock-mode-off') }
            </div></div></div>
            <br/>`
            ;
            break;
    }//pre-append
    parent.append(appendDOMString);
    switch (type) {//after-append
        case "autocheck":
            autoCheckInitializer();
            break;
        case "predefined":
            predefinedInitializer();
            break;
        case "task-reservation":
            reservedInitializer();
            break;
        case "personalization-notify-sound":
            personalizationSoundInitializer();
            break;
        case "i18n":
            languageInitializer();
            break;
        case "hotkey":
            hotkeyInitializer();
            break;
        case "locker":
            lockerInitializer();
            break;
    }
}

/*
    Custom Functions
*/

//settings-goto implementation for compatibility reason
$(function () {
    switch (store.get("settings-goto")) {
        case "predefined-tasks":
            $("#collapsed-predefined").addClass("show");
            $("#collapse-toggle-predefined").text(i18n.__("fold") + " ");
            window.location.hash = "#collapsed-predefined";
            break;
        case "task-reservation":
            $("#collapsed-task-reservation").addClass("show");
            $("#collapse-toggle-task-reservation").text(i18n.__("fold") + " ");
            window.location.hash = "#collapsed-task-reservation";
            break;
        case "data-management":
            $("#collapsed-data-management").addClass("show");
            $("#collapse-toggle-data-management").text(i18n.__("fold") + " ");
            window.location.hash = "#collapsed-data-management";
            break;
        case "locker":
            $("#collapsed-locker").addClass("show");
            $("#collapse-toggle-locker").text(i18n.__("fold") + " ");
            break;
    }
    store.set("settings-goto", "settings");
})

//autocheck
function autoCheckInitializer() {
    if (store.get("autocheck") !== false)
        $("#selection-autocheck").prop("checked", true);
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

function predefinedInitializer() {
    defaultArray.forEach(function (item, index, array) {
        planAppend(item, index);
    });
    if (store.has("default-task")) setAsDefault(store.get("default-task"));
}

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
        "<li id='item" + index + "'> <input name='title' id='title" + index + "' type='text' class='rest' maxlength='15' value='" +
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
    store.set("settings-goto", "predefined-tasks");
    location.reload();
}

function planAdd() {
    let tempItem = newItem;
    defaultArray.push(tempItem);
    store.set("predefined-tasks", defaultArray);
    planAppend(tempItem, defaultArray.length - 1);
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

//task reserved
let reservedUseDefaultArray = store.get("predefined-tasks");
let reservedArray = store.has("reserved") ? store.get("reserved") : [];
let newReservedItem = {
    id: store.get("reserved-record") + 1,
    time: "23:59",
    endTime: "24:00",
    plan: "0",
    cycle: "0"
};

function reservedInitializer() {
    reservedArray.forEach(function (item, index, array) {
        reservedAppend(item, index);
    });
}

function reservedAppend(item, index) {
    $("#reservation-list").append('<li id="reserved-' + index + '">\
                ' + i18n.__('task-reservation-time-setting') + ' <input id="reserved-time-' + index + '" type="time"\
                onchange="reservedEdit(' + index + ')" value="' + item.time + '" /><br/>'
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
    store.set("settings-goto", "task-reservation");
    location.reload();
}

function reservedAdd() {
    reservedArray.push(newReservedItem);
    reservedListReorder();
    store.set("reserved-record", store.get("reserved-record") + 1);
    newReservedItem.id = store.get("reserved-record") + 1;
    store.set("reserved-cnt", store.get("reserved-cnt") + 1);
    reservedAppend(newReservedItem, reservedArray.length - 1);
    store.set("settings-goto", "task-reservation");
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

//personalization notification

function personalizedNotification() {
    $(".personalization-notification").each(function () {
        if ($(this).val() && $(this).val() !== "")
            store.set("personalization-notification." + $(this).attr("name"), $(this).val());
        else store.delete("personalization-notification." + $(this).attr("name"));
    });
}

//personalization sound
function personalizationSoundInitializer() {
    let player = document.createElement("audio");//alert player
    let soundList = ['alarming', 'beep', 'clock', 'tick', 'trumpet', 'whistle', 'horns', 'magic', 'piano'];
    for (let i in soundList) {
        $("#work-time-end-sound-select").append("\
                    <a class='dropdown-item' href='javascript:workTimeEndSoundSetting(\"" + soundList[i] + "\")'>"
            + soundList[i] + "</a>");
    }
    $("#work-time-end-sound-dropdown-button").text(store.has("time-end-sound") ? store.get("time-end-sound") : "tick");

    for (let i in soundList) {
        $("#all-time-end-sound-select").append("\
                    <a class='dropdown-item' href='javascript:allTimeEndSoundSetting(\"" + soundList[i] + "\")'>"
            + soundList[i] + "</a>");
    }
    $("#all-time-end-sound-dropdown-button").text(store.has("all-end-sound") ? store.get("all-end-sound") : "piano");
}

function workTimeEndSoundSetting(val) {
    try {
        let player = document.createElement("audio");//alert player
        store.set("time-end-sound", val);
        $("#work-time-end-sound-dropdown-button").text(val);
        player.src = path.join(__dirname, "\\res\\sound\\" + val + ".mp3");
        player.loop = false;
        player.play();
    } catch (e) {
        console.log(e);
    }
}

function allTimeEndSoundSetting(val) {
    try {
        let player = document.createElement("audio");//alert player
        store.set("all-end-sound", val);
        $("#all-time-end-sound-dropdown-button").text(val);
        player.src = path.join(__dirname, "\\res\\sound\\" + val + ".mp3");
        player.loop = false;
        player.play();
    } catch (e) {
        console.log(e);
    }
}

//language settings
function languageInitializer() {
    for (i in languageList) {
        $("#i18n").append("\
                    <a class='dropdown-item' href='javascript:languageSetting(\"" + languageList[i] + "\")'>"
            + languageNameList[i] + "</a>");
        if (store.get("i18n") === languageList[i]) {
            $("#language-dropdown-button").text(languageNameList[i]);
        }
    }
}

function languageSetting(val) {
    if (store.get('i18n') !== val) {
        store.set("i18n", val);
    }
    ipc.send("relaunch-dialog");
}

//hotkey
let hotkeyTo = "", keyDownGet = "";
let hotkeyList = store.get("hotkey");

function hotkeyInitializer() {
    for (let i in hotkeyList) {
        $("#hotkey-box").append("\
                <div class=\"col-6\">\
                <label id = \"hotkey-for-" + hotkeyList[i].name + "\" class= \"hotkey-set-label text-muted settings-msg\" ></label>\
                </div><div class=\"col-6\">\
            <input id=\"hotkey-" + hotkeyList[i].name + "\" class=\"hotkey-set-input extreme-small\" type=\"text\" maxlength=\"64\"\
                onclick=\"keyDownCapturer(\'" + hotkeyList[i].name + "\')\" onblur=\"keyDownTriggerRemover()\" /></div><br />");
        $("#hotkey-for-" + hotkeyList[i].name).text(i18n.__("hotkey-for-" + hotkeyList[i].name));
        $("#hotkey-" + hotkeyList[i].name).val(hotkeyList[i].value);
    }
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

    if (event.metaKey) keyDownGet += (process.platform === "darwin") ? "Cmd + " : "";
    if (event.ctrlKey) keyDownGet += "Ctrl + ";
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

//data management of setting items and statistics
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
            ipc.send("relaunch-dialog");
        } else {
            formerData = store.store;
            store.clear();
            store.set(decryptedData);
            ipc.send("relaunch-dialog");
        }
    } catch (error) {
        ipc.send("alert", i18n.__('settings-import-error'))
        isAllRight = false;
        if (mode === "statistics") statistics.set(formerData);
        else store.set(formerData);
    }
}

//locker
function lockerInitializer() {
    $('#passcode-locker').attr('placeholder', i18n.__('locker-settings-input'));
    $('#passcode-locker-again').attr('placeholder', i18n.__('locker-settings-input-again'));
}

function lock(passcode, again) {
    let md5 = require('crypto-js/md5');
    if (passcode === "" || again === "") ipc.send("locker-passcode", 'empty');
    else if (!store.get('islocked')) {
        if (passcode === again) {
            store.set('lockerpasscode', md5(passcode).toString());
            store.set('islocked', true);
            ipc.send("relaunch-dialog");
        } else ipc.send("locker-passcode", 'not-same-password');
    } else {
        if (passcode === again) {
            if (passcode === store.get('lockerpasscode') || md5(passcode).toString() === store.get('lockerpasscode')) {
                store.set('islocked', false);
                ipc.send("relaunch-dialog");
            } else ipc.send("locker-passcode", 'wrong-passcode');
        } else ipc.send("locker-passcode", 'not-same-password');
    }
}