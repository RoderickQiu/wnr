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
    initializeSettingsTipToggles(container);
    if (!inner) {
        refreshSettingsCoupling();
        initializeSettingsSectionNav(container);
    }
}

function initializeSettingsTipToggles(container) {
    $(container).find('p.settings-msg').each(function () {
        let tip = $(this);
        if (tip.data('settings-tip-ready') || tip.hasClass('d-none')) return;
        if ($.trim(tip.text()) === '' && tip.find('a').length === 0) return;

        let button = $(`
            <button type="button" class="settings-tip-toggle" aria-expanded="false" title="${ i18n.__('helper') }">
                ?
            </button>
        `);

        tip.data('settings-tip-ready', true);
        tip.addClass('settings-tip-content settings-tip-collapsed');
        tip.attr('aria-hidden', 'true');

        let label = tip.prevAll('label:first');
        if (label.length > 0) label.after(button);
        else tip.before(button);

        button.on('click', function () {
            let expanded = button.attr('aria-expanded') === 'true';
            button.attr('aria-expanded', expanded ? 'false' : 'true');
            tip.toggleClass('settings-tip-collapsed', expanded);
            tip.attr('aria-hidden', expanded ? 'true' : 'false');
        });
    });
}

function requestSettingsRelaunch() {
    ipc.send('relaunch-dialog');
}

function setSettingsCoupling(id, show, text) {
    let line = $('#coupling-' + id);
    if (line.length === 0) return;
    line.text(text || '');
    line.toggleClass('d-none', !show);
}

function setSelectionDisabled(id, disabled) {
    let selection = $('#selection-' + id);
    if (selection.length === 0) return;
    selection.prop('disabled', !!disabled);
}

function setDropdownDisabled(id, disabled) {
    let button = $('#dropdown-button-' + id);
    if (button.length === 0) return;
    button.toggleClass('disabled', !!disabled);
    button.attr('aria-disabled', disabled ? 'true' : 'false');
    button.attr('tabindex', disabled ? '-1' : '0');
}

function hasReservedSessions() {
    let reserved = store.get('reserved');
    if (Array.isArray(reserved)) return reserved.length > 0;
    return !!(reserved && String(reserved) !== '');
}

function hasDefaultPlan() {
    if (!store.has('default-task')) return false;
    let index = Number(store.get('default-task'));
    return !isNaN(index) && index >= 0;
}

function refreshSettingsCoupling() {
    let percentageOn = Number(store.has('percentage-break-mode') ? store.get('percentage-break-mode') : 0) !== 0;
    let infinityOn = store.get('infinity') === true;
    let reservedOn = hasReservedSessions();
    let defaultOn = hasDefaultPlan();
    let looseOff = Number(store.has('loose-mode-dropdown') ? store.get('loose-mode-dropdown') : 0) === 0;
    let continueAfterLock = store.get('timing-after-locked') === true;
    let autostartBlocked = !defaultOn || reservedOn;
    let autostartReason = '';
    if (reservedOn) autostartReason = i18n.__('settings-coupling-autostart-reserved');
    else if (!defaultOn) autostartReason = i18n.__('settings-coupling-autostart-no-default');

    setSettingsCoupling('percentage-break-mode', percentageOn, i18n.__('settings-coupling-percentage-rest'));
    $('input[id^="rest-time"]').prop('readonly', percentageOn);
    $('.settings-coupling-plan-rest').toggleClass('d-none', !percentageOn);

    $('input[id^="loops"]').prop('readonly', infinityOn);
    $('.settings-coupling-plan-loops').toggleClass('d-none', !infinityOn);
    setDropdownDisabled('disable-back', infinityOn);
    setSettingsCoupling('disable-back', infinityOn, i18n.__('settings-coupling-infinity-cancel'));

    setSelectionDisabled('autostarttask', autostartBlocked);
    setSettingsCoupling('autostarttask', autostartBlocked, autostartReason);

    setSelectionDisabled('force-screen-lock-mode', !(looseOff && continueAfterLock));
    setSettingsCoupling('force-screen-lock-mode', !(looseOff && continueAfterLock), i18n.__('settings-coupling-force-lock'));
}

function saveSettingsViewState() {
    let open = [];
    $('#settings-container .collapse.show').each(function () {
        open.push(this.id);
    });
    let container = document.getElementById('settings-container');
    sessionStorage.setItem('wnr-settings-view', JSON.stringify({
        scroll: container ? container.scrollTop : 0,
        open: open
    }));
}

function restoreSettingsViewState() {
    let raw = sessionStorage.getItem('wnr-settings-view');
    if (!raw) return;
    sessionStorage.removeItem('wnr-settings-view');
    let state = null;
    try {
        state = JSON.parse(raw);
    } catch (e) {
        return;
    }
    if (!state) return;
    if (state.open) {
        for (let i = 0; i < state.open.length; i++) {
            let collapse = document.getElementById(state.open[i]);
            if (!collapse) continue;
            collapse.classList.add('show');
            if (state.open[i].indexOf('collapsed-') === 0) {
                $('#collapse-toggle-' + state.open[i].slice('collapsed-'.length)).text(i18n.__('fold') + ' ');
            }
        }
    }
    if (typeof state.scroll === 'number') {
        requestAnimationFrame(function () {
            layoutSettingsHeader();
            let container = document.getElementById('settings-container');
            if (container) container.scrollTop = state.scroll;
            syncSettingsSectionNav(container);
        });
    } else {
        layoutSettingsHeader();
    }
}

function titleSolution(obj, parent) {
    let id = obj.id;
    let topLevel = parent.is('#settings-container');
    parent.append(`
    <div class="row w-100 align-items-center${ topLevel ? ' settings-section-anchor' : '' }"${ topLevel ? ' id="settings-anchor-' + id + '" data-section="' + id + '"' : '' }>
        <div class="col-12">
            <${ topLevel ? 'div' : 'small' } class="settings-title${ topLevel ? ' settings-section-heading' : ' text-grey' }">${ i18n.__(id) }</${ topLevel ? 'div' : 'small' }>
        </div>
    </div>
    <br />
    `);
}

function settingsContainerEl() {
    return document.getElementById('settings-container');
}

function sectionScrollTop(container, target) {
    return target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
}

function markSettingsSectionCurrent(sectionId) {
    let items = document.querySelectorAll('.settings-section-nav-item');
    for (let i = 0; i < items.length; i++) {
        items[i].classList.toggle('is-current', items[i].getAttribute('data-section') === sectionId);
        if (items[i].getAttribute('data-section') !== sectionId) items[i].blur();
    }
}

function scrollSettingsToTop() {
    let el = settingsContainerEl();
    if (!el) return;
    let first = el.querySelector('.settings-section-anchor');
    if (first) markSettingsSectionCurrent(first.getAttribute('data-section'));
    if (typeof el.scrollTo === 'function') el.scrollTo({ top: 0, behavior: 'smooth' });
    else el.scrollTop = 0;
}

function scrollSettingsToSection(id) {
    let el = settingsContainerEl();
    let target = document.getElementById('settings-anchor-' + id);
    if (!el || !target) return;
    markSettingsSectionCurrent(id);
    let top = Math.max(0, sectionScrollTop(el, target));
    if (typeof el.scrollTo === 'function') el.scrollTo({ top: top, behavior: 'smooth' });
    else el.scrollTop = top;
}

function layoutSettingsHeader() {
    let header = document.getElementById('settings-header');
    let el = settingsContainerEl();
    if (!header || !el) return;
    let bottom = header.offsetTop + header.offsetHeight;
    el.style.top = bottom + 'px';
    el.style.height = Math.max(160, window.innerHeight - bottom - 12) + 'px';
}

function syncSettingsSectionNav(el) {
    if (!el) return;
    document.body.classList.toggle('settings-scrolled', el.scrollTop > 24);
    let anchors = el.querySelectorAll('.settings-section-anchor');
    if (!anchors.length) return;

    let current = anchors[0].getAttribute('data-section');
    let nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (nearBottom) {
        current = anchors[anchors.length - 1].getAttribute('data-section');
    } else {
        let probe = el.getBoundingClientRect().top + 20;
        for (let i = 0; i < anchors.length; i++) {
            if (anchors[i].getBoundingClientRect().top <= probe) {
                current = anchors[i].getAttribute('data-section');
            }
        }
    }
    markSettingsSectionCurrent(current);
}

function initializeSettingsSectionNav(container) {
    let el = $(container)[0] || settingsContainerEl();
    let button = document.getElementById('settings-back-to-top');
    let nav = document.getElementById('settings-section-nav');
    if (!el) return;

    if (button) {
        button.setAttribute('title', i18n.__('settings-back-to-top'));
        button.setAttribute('aria-label', i18n.__('settings-back-to-top'));
        button.textContent = '↑';
        button.onclick = scrollSettingsToTop;
    }

    if (nav) {
        nav.innerHTML = '';
        let anchors = el.querySelectorAll('.settings-section-anchor');
        for (let i = 0; i < anchors.length; i++) {
            let id = anchors[i].getAttribute('data-section');
            let item = document.createElement('button');
            item.type = 'button';
            item.className = 'settings-section-nav-item';
            item.setAttribute('data-section', id);
            item.textContent = i18n.__(id);
            item.onclick = function (sectionId) {
                return function () { scrollSettingsToSection(sectionId); };
            }(id);
            nav.appendChild(item);
        }
        nav.style.display = anchors.length ? 'flex' : 'none';
    }

    layoutSettingsHeader();
    el.addEventListener('scroll', function () { syncSettingsSectionNav(el); }, { passive: true });
    window.addEventListener('resize', layoutSettingsHeader);
    syncSettingsSectionNav(el);
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
                <a class="btn btn-sm btn-outline-primary settings-collapse-toggle" data-toggle="collapse" href="#collapsed-${ id }" role="button"
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
                <p class="settings-coupling d-none" id="coupling-${ id }"></p>
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
    let choiceLabel = function (key) {
        return (id === 'alarmtip-duration') ? i18n.__('alarmtip-duration-' + key) : i18n.__('dropdown-' + key);
    };
    for (let i in choices) {
        let label = choiceLabel(choices[i]);
        $('#dropdown-' + id).append(`
            <a class='dropdown-item' href="javascript:dropdownTrigger('${ id }',${ i }, '${ label.replace(/'/g, "\\'") }',${ relaunch },${ after })">
                ${ label }
            </a>
        `);
    }
    if (!store.has(id)) $('#dropdown-button-' + id).html(choiceLabel(choices[def]));
    else {
        $('#dropdown-button-' + id).html(choiceLabel(choices[store.get(id)]));
        console.log(choiceLabel(choices[store.get(id)]), "CHOICE", id, store.get(id));
    }
    if (id === 'alarmtip-duration') {
        const customVal = store.get('alarmtip-duration-custom') || 45;
        parent.append(`
            <div id="alarmtip-custom-row" class="row w-100 align-items-center" style="display:none">
                <div class="col-8 text-left">
                    <label>${i18n.__('alarmtip-duration-custom')}</label>
                </div>
                <div class="col-4 text-right">
                    <input type="number" id="alarmtip-custom-input" class="hotkeyset"
                           value="${customVal}" min="1" max="1440"
                           onchange="store.set('alarmtip-duration-custom', Number(this.value))"
                           oninput="if(Number(value)<1)value=1;if(Number(value)>1440)value=1440"/>
                    <span class="small text-muted">${i18n.__('min')}</span>
                </div>
            </div>
            <br/>
        `);
        after(store.has(id) ? store.get(id) : def);
    }
}

function dropdownTrigger(id, choiceId, choiceMsg, relaunch, after) {
    if ($('#dropdown-button-' + id).hasClass('disabled')) return;
    $('#dropdown-button-' + id).html(choiceMsg);
    console.log(id, choiceId, choiceMsg, relaunch, after);
    store.set(id, choiceId);
    after(choiceId);//do after execution jobs
    if (relaunch) requestSettingsRelaunch();
    refreshSettingsCoupling();
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
                <p class="settings-coupling d-none" id="coupling-${ id }"></p>
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
        if (relaunch) requestSettingsRelaunch();
        refreshSettingsCoupling();
    });
}

function customSolution(type, parent) {
    parent.append(domString(type));
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
        case "data-management":
            break;
        case "webdav-sync":
            webDavSyncInitializer();
            break;
        case "locker":
            lockerInitializer();
            break;
        case "theme-color":
            colorInitializer();
            break;
    }
}

function domString(type) {
    let appendDOMString = ``;
    switch (type) {
        case "theme-color":
            appendDOMString = `
            <div id="color-box" class="row w-100"></div>
            <br/>
            <div class="row w-100">
                <div class="col-12 text-right">
                    <a class="btn btn-sm btn-outline-primary" href="javascript:resetThemeColors()">
                        ${ i18n.__("reset-theme-colors") }
                    </a>
                </div>
            </div>
            <br/>`;
            break;
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
        case "simple-countdown-settings":
            let defaultCountdownTime = store.has("simple-countdown-time") ? store.get("simple-countdown-time") : 2;
            let defaultCountdownFocus = store.has("simple-countdown-focus") ? store.get("simple-countdown-focus") : false;
            appendDOMString = `
            <div class="w-100 row align-items-center">
                <div class="col-8 text-left">
                    <label>
                        ${ i18n.__("simple-countdown-time") }
                    </label>
                </div>
                <div class="col-4 text-right">
                    <input id="simple-countdown-time-input" type="number" class="hotkeyset" 
                           value="${ defaultCountdownTime }" 
                           onchange="store.set('simple-countdown-time', Number($('#simple-countdown-time-input').val()))"
                           oninput="if (Number(value) > 1440) value = 1440; if (Number(value) < 0.1) value = 0.1"
                           style="ime-mode:Disabled" 
                           title="${ i18n.__('what-can-be-here-predefined-tasks') }" />
                    <span class="text-muted small"> ${ i18n.__('min') }</span>
                </div>
            </div>
            <br/>
            <div class="w-100 row align-items-center">
                <div class="col-9 text-left">
                    <label>
                        ${ i18n.__("simple-countdown-focus") }
                    </label>
                </div>
                <div class="col-3 text-right">
                    <label class="switch-slide">
                        <input type="checkbox" id="simple-countdown-focus-checkbox" hidden
                               ${ defaultCountdownFocus ? 'checked' : '' }
                               onclick="store.set('simple-countdown-focus', $('#simple-countdown-focus-checkbox').prop('checked'))">
                        <label for="simple-countdown-focus-checkbox" class="switch-slide-label"></label>
                    </label>
                </div>
            </div>
            <br/>`;
            break;
        case "personalization-notify-sound":
            appendDOMString = `
            <div class="w-100 row align-items-center">
            <div class="col-7">
            <label>
                ${ i18n.__("personalization-notify-sound-msg-work-end") }
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
            <div class="col-5 custom-notify-sound-work-time-end">
            <label>
                ${ i18n.__("custom-notify-sound") }
            </label>
            </div>
            <div class="col-7 text-right custom-notify-sound-work-time-end">
            <input id="custom-notify-sound-work-time-end" name="custom-notify-sound-work-time-end"
                       type="text" class="hotkey-set-input extreme-small text-right" 
                       placeholder="${ i18n.__('input-url') }"
                       onkeyup="store.set('custom-work-time-end-sound',$('#custom-notify-sound-work-time-end').val());" />
            </div><br/>
            <div class="col-7">
            <label>
                ${ i18n.__("personalization-notify-sound-msg-rest-end") }
            </label>
            </div>
            <div class="col-5 text-right">
            <div class="dropdown">
                <a aria-expanded="false"
                   aria-haspopup="true" class="btn btn-outline-secondary dropdown-toggle"
                   data-toggle="dropdown"
                   id="rest-time-end-sound-dropdown-button">
                </a>
                <div aria-labelledby="rest-time-end-sound-dropdown-button" class="dropdown-menu"
                     id="rest-time-end-sound-select">
                </div>
            </div><br/>
            </div>
            <div class="col-5 custom-notify-sound-rest-time-end">
            <label>
                ${ i18n.__("custom-notify-sound") }
            </label>
            </div>
            <div class="col-7 text-right custom-notify-sound-rest-time-end">
            <input id="custom-notify-sound-rest-time-end" name="custom-notify-sound-rest-time-end"
                       type="text" class="hotkey-set-input extreme-small text-right" 
                       placeholder="${ i18n.__('input-url') }"
                       onkeyup="store.set('custom-rest-time-end-sound',$('#custom-notify-sound-rest-time-end').val());" />
            </div><br/>
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
            <div class="col-5 custom-notify-sound-all-time-end">
            <label>
                ${ i18n.__("custom-notify-sound") }
            </label>
            </div>
            <div class="col-7 text-right custom-notify-sound-all-time-end">
            <input id="custom-notify-sound-all-time-end" name="custom-notify-sound-all-time-end" type="text" 
                       class="hotkey-set-input extreme-small text-right" 
                       placeholder="${ i18n.__('input-url') }"
                        onkeyup="store.set('custom-all-time-end-sound',$('#custom-notify-sound-all-time-end').val());"/>
            </div><br/>
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
        case "webdav-sync":
            appendDOMString = `
            <div class="w-100">
                <div class="small text-muted webdav-sync-form">
                    <div class="row no-gutters align-items-center webdav-sync-form-row">
                        <div class="col-4 webdav-sync-form-label">
                            <label for="webdav-sync-url">${ i18n.__('webdav-sync-url') }</label>
                        </div>
                        <div class="col-8">
                            <input id="webdav-sync-url" name="webdav-sync-url" type="text"
                                   placeholder="${ i18n.__('webdav-sync-url-placeholder') }" />
                        </div>
                    </div>
                    <div class="row no-gutters align-items-center webdav-sync-form-row">
                        <div class="col-4 webdav-sync-form-label">
                            <label for="webdav-sync-username">${ i18n.__('webdav-sync-username') }</label>
                        </div>
                        <div class="col-8">
                            <input id="webdav-sync-username" name="webdav-sync-username" type="text" />
                        </div>
                    </div>
                    <div class="row no-gutters align-items-center webdav-sync-form-row">
                        <div class="col-4 webdav-sync-form-label">
                            <label for="webdav-sync-password">${ i18n.__('webdav-sync-password') }</label>
                        </div>
                        <div class="col-8">
                            <input id="webdav-sync-password" name="webdav-sync-password" type="password" />
                        </div>
                    </div>
                    <div class="row no-gutters align-items-center webdav-sync-form-row">
                        <div class="col-4 webdav-sync-form-label">
                            <label for="webdav-sync-remote-path">${ i18n.__('webdav-sync-remote-path') }</label>
                        </div>
                        <div class="col-8">
                            <input id="webdav-sync-remote-path" name="webdav-sync-remote-path" type="text"
                                   placeholder="${ i18n.__('webdav-sync-remote-path-placeholder') }" />
                        </div>
                    </div>
                </div>
                <div class="row no-gutters w-100 align-items-center webdav-sync-toggle-row">
                    <div class="col-9 text-left">
                        <label>${ i18n.__('webdav-sync-enabled') }</label><br />
                        <p class="settings-msg">${ i18n.__('webdav-sync-enabled-tip') }</p>
                    </div>
                    <div class="col-3 text-right">
                        <label class="switch-slide">
                            <input type="checkbox" id="selection-webdav-sync-enabled" hidden role="switch">
                            <label for="selection-webdav-sync-enabled" class="switch-slide-label"></label>
                        </label>
                    </div>
                </div>
                <div class="small text-muted webdav-sync-actions">
                    <a class="rest underlined" href="javascript:webDavSyncTest()">${ i18n.__('webdav-sync-test') }</a>
                    <span class="webdav-sync-action-sep">|</span>
                    <a class="rest underlined" href="javascript:webDavSyncUpload()">${ i18n.__('webdav-sync-upload') }</a>
                    <span class="webdav-sync-action-sep">|</span>
                    <a class="rest underlined" href="javascript:webDavSyncDownload()">${ i18n.__('webdav-sync-download') }</a>
                </div>
                <p class="small text-muted" id="webdav-sync-auto-status"></p>
                <p class="small text-muted" id="webdav-sync-startup-status"></p>
                <p class="small text-muted" id="webdav-sync-push-status"></p>
                <p class="small text-muted" id="webdav-sync-status"></p>
                <p class="small text-muted d-none" id="webdav-sync-detail-toggle-container">
                    <a class="underlined" href="javascript:toggleWebDavSyncDetails()" id="webdav-sync-detail-toggle">
                        ${ i18n.__('webdav-sync-show-details') }
                    </a>
                </p>
                <pre class="small text-muted d-none" id="webdav-sync-detail"></pre>
            </div>
            <br/>`;
            break;
        case "locker":
            appendDOMString = `
            <div class="w-100 row align-items-center">
            <div class="col-12">
            <small class="text-grey">
                ${ i18n.__('locker-now-status') }<span class="font-weight-bold rest">
                ${ store.get('islocked') ? i18n.__('on') : i18n.__('off') } </span> ${ i18n.__('period-symbol') }
            </small>
            <p class="settings-coupling locker-lock-out-hint">${ i18n.__('locker-lock-out-hint') }</p>
            <label class="locker-field-label" for="passcode-locker">${ i18n.__('locker-settings-input') }</label>
            <input id="passcode-locker" maxlength="11" name="passcode-locker"
            onkeydown="if(event.keyCode === 13) lock($('#passcode-locker').val(), $('#passcode-locker-again').val());"
            type="password" />
            <label class="locker-field-label" for="passcode-locker-again">${ i18n.__('locker-settings-input-again') }</label>
            <input id="passcode-locker-again" maxlength="11" name="passcode-locker-again"
            onkeydown="if(event.keyCode === 13) lock($('#passcode-locker').val(), $('#passcode-locker-again').val());"
            type="password" />
            <div class="locker-submit-row">
                <a class="btn btn-sm btn-outline-primary" id="locker-submit"
                   href="javascript:lock($('#passcode-locker').val(), $('#passcode-locker-again').val());">
                    ${ store.get('islocked') ? i18n.__('locker-turn-off') : i18n.__('locker-turn-on') }
                </a>
            </div>
            <small class="text-grey settings-title">
            ${ store.get('islocked') ? i18n.__('locker-settings-input-tip-lock-mode-on') : i18n.__('locker-settings-input-tip-lock-mode-off') }
            </small></div></div>
            <br/>`
            ;
            break;
    }//pre-append
    return appendDOMString;
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
        case "webdav-sync":
            $("#collapsed-webdav-sync").addClass("show");
            $("#collapse-toggle-webdav-sync").text(i18n.__("fold") + " ");
            window.location.hash = "#collapsed-webdav-sync";
            break;
        case "locker":
            $("#collapsed-locker").addClass("show");
            $("#collapse-toggle-locker").text(i18n.__("fold") + " ");
            break;
    }
    store.set("settings-goto", "settings");
    restoreSettingsViewState();
})

//autocheck
function autoCheckInitializer() {
    if (store.get("autocheck") !== false)
        $("#selection-autocheck").prop("checked", true);
}

//defaults settings
const predefinedTasksUtil = require("./predefined-tasks");
let defaultArray = predefinedTasksUtil.sanitizePredefinedTasks(store.get("predefined-tasks"));
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
    defaultArray[index].name = predefinedTasksUtil.sanitizeTaskName($("#title" + index).val());
    if (!isNaN(Number($("#work-time" + index).val())) && Number($("#work-time" + index).val()) >= 0.083) defaultArray[index].workTime = $("#work-time" + index).val();
    else $("#work-time" + index).val(defaultArray[index].workTime);
    if (!$("#rest-time" + index).prop("readonly")) {
        if (!isNaN(Number($("#rest-time" + index).val())) && Number($("#rest-time" + index).val()) >= 0.083) defaultArray[index].restTime = $("#rest-time" + index).val();
        else $("#rest-time" + index).val(defaultArray[index].restTime);
    }
    if (!$("#loops" + index).prop("readonly")) {
        if (!isNaN(Number($("#loops" + index).val())) && Number($("#loops" + index).val()) >= 1) defaultArray[index].loops = $("#loops" + index).val();
        else $("#loops" + index).val(defaultArray[index].loops);
    }
    defaultArray[index].focusWhenWorking = !!document.getElementById("focus-when-working" + index).checked;
    defaultArray[index].focusWhenResting = !!document.getElementById("focus-when-resting" + index).checked;
    store.set("predefined-tasks", defaultArray);
}

function planAppend(item, index) {
    let li = document.createElement("li");
    li.id = "item" + index;

    let titleInput = document.createElement("input");
    titleInput.name = "title";
    titleInput.id = "title" + index;
    titleInput.type = "text";
    titleInput.className = "rest";
    titleInput.maxLength = 15;
    titleInput.value = item.name;
    titleInput.addEventListener("change", function () { planEdit(index); });

    let details = document.createElement("div");
    details.className = "text-muted small";

    let workInput = document.createElement("input");
    workInput.id = "work-time" + index;
    workInput.className = "hotkeyset";
    workInput.type = "number";
    workInput.value = item.workTime;
    workInput.style.imeMode = "Disabled";
    workInput.title = i18n.__("what-can-be-here-predefined-tasks");
    workInput.addEventListener("change", function () { planEdit(index); });
    workInput.addEventListener("input", function () {
        if (Number(workInput.value) > 1000) workInput.value = 1000;
    });

    let restInput = document.createElement("input");
    restInput.id = "rest-time" + index;
    restInput.className = "hotkeyset";
    restInput.type = "number";
    restInput.value = item.restTime;
    restInput.style.imeMode = "Disabled";
    restInput.title = i18n.__("what-can-be-here-predefined-tasks");
    restInput.addEventListener("change", function () { planEdit(index); });
    restInput.addEventListener("input", function () {
        if (Number(restInput.value) > 1000) restInput.value = 1000;
    });

    let loopsInput = document.createElement("input");
    loopsInput.id = "loops" + index;
    loopsInput.className = "hotkeyset";
    loopsInput.type = "number";
    loopsInput.value = item.loops;
    loopsInput.style.imeMode = "Disabled";
    loopsInput.addEventListener("change", function () { planEdit(index); });
    loopsInput.addEventListener("input", function () {
        if (loopsInput.value.length > 2) loopsInput.value = loopsInput.value.slice(0, 2);
    });

    let focusWork = document.createElement("input");
    focusWork.id = "focus-when-working" + index;
    focusWork.type = "checkbox";
    focusWork.addEventListener("change", function () { planEdit(index); });

    let focusRest = document.createElement("input");
    focusRest.id = "focus-when-resting" + index;
    focusRest.type = "checkbox";
    focusRest.addEventListener("change", function () { planEdit(index); });

    let defaultContainer = document.createElement("span");
    defaultContainer.id = "set-as-default-task-container" + index;
    let defaultLink = document.createElement("a");
    defaultLink.id = "set-as-default" + index;
    defaultLink.className = "rest underlined";
    defaultLink.href = "#";
    defaultLink.textContent = i18n.__("set-as-default-task");
    defaultLink.addEventListener("click", function (event) {
        event.preventDefault();
        setAsDefault(index);
    });
    defaultContainer.appendChild(defaultLink);

    let deleter = document.createElement("span");
    deleter.id = "deleter" + index;
    deleter.appendChild(document.createTextNode("| "));
    let deleteLink = document.createElement("a");
    deleteLink.href = "#";
    deleteLink.className = "work underlined";
    deleteLink.textContent = i18n.__("delete");
    deleteLink.addEventListener("click", function (event) {
        event.preventDefault();
        planErase(index);
    });
    deleter.appendChild(deleteLink);

    details.appendChild(document.createTextNode(i18n.__("predefined-tasks-settings-tip-part-1") + " "));
    details.appendChild(workInput);
    details.appendChild(document.createTextNode(" " + i18n.__("min") + i18n.__("predefined-tasks-settings-tip-part-2") + " "));
    details.appendChild(restInput);
    details.appendChild(document.createTextNode(" " + i18n.__("min") + i18n.__("predefined-tasks-settings-tip-part-3") + " "));
    details.appendChild(loopsInput);
    details.appendChild(document.createTextNode(" " + i18n.__("time(s)")));
    let restCoupling = document.createElement("div");
    restCoupling.className = "settings-coupling settings-coupling-plan-rest d-none";
    restCoupling.textContent = i18n.__("settings-coupling-percentage-rest");
    details.appendChild(restCoupling);
    let loopsCoupling = document.createElement("div");
    loopsCoupling.className = "settings-coupling settings-coupling-plan-loops d-none";
    loopsCoupling.textContent = i18n.__("settings-coupling-infinity-loops");
    details.appendChild(loopsCoupling);
    details.appendChild(document.createElement("br"));
    details.appendChild(document.createTextNode(i18n.__("focus-when-working") + " "));
    details.appendChild(focusWork);
    details.appendChild(document.createTextNode("\u00a0\u00a0|\u00a0"));
    details.appendChild(document.createTextNode(i18n.__("focus-when-resting") + " "));
    details.appendChild(focusRest);
    details.appendChild(document.createElement("br"));
    details.appendChild(defaultContainer);
    details.appendChild(deleter);

    li.appendChild(document.createTextNode(" "));
    li.appendChild(titleInput);
    li.appendChild(document.createTextNode(" "));
    li.appendChild(document.createElement("br"));
    li.appendChild(details);
    li.appendChild(document.createElement("hr"));
    document.getElementById("itemlist-ul").appendChild(li);

    focusWork.checked = item.focusWhenWorking;
    focusRest.checked = item.focusWhenResting;
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
    if ($('#set-as-default' + index).text() !== i18n.__('cancel-default-task')) {
        $("#deleter" + store.get("default-task")).css("display", "inline");
        $('#title' + store.get("default-task")).removeClass("work");
        $('#set-as-default' + store.get("default-task")).text(i18n.__('set-as-default-task'));
        $('#title' + store.get("default-task")).addClass("rest");
        store.set("default-task", index);
        $('#set-as-default' + index).text(i18n.__('cancel-default-task'));
        $("#deleter" + index).css("display", "none");
        $('#title' + index).removeClass("rest");
        $('#title' + index).addClass("work");
    } else {
        store.set("default-task", -1);
        $('#set-as-default' + index).text(i18n.__('set-as-default-task'));
        $("#deleter" + index).css("display", "inline");
        $('#title' + index).removeClass("work");
        $('#title' + index).addClass("rest");
    }
    refreshSettingsCoupling();
}

//task reserved
let reservedUseDefaultArray = predefinedTasksUtil.sanitizePredefinedTasks(store.get("predefined-tasks"));
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
    let selectedPlan = reservedUseDefaultArray[item.plan] || reservedUseDefaultArray[0];
    let selectedPlanIndex = reservedUseDefaultArray[item.plan] ? item.plan : 0;

    let li = document.createElement("li");
    li.id = "reserved-" + index;

    let timeInput = document.createElement("input");
    timeInput.id = "reserved-time-" + index;
    timeInput.type = "time";
    timeInput.value = item.time == null ? "" : String(item.time);
    timeInput.addEventListener("change", function () { reservedEdit(index); });

    let dropdown = document.createElement("div");
    dropdown.className = "dropdown dropdown-default";

    let dropdownButton = document.createElement("a");
    dropdownButton.className = "btn btn-outline-secondary dropdown-toggle dropdown-reserved-button";
    dropdownButton.id = "dropdown-reserved-button-" + index;
    dropdownButton.setAttribute("data-toggle", "dropdown");
    dropdownButton.setAttribute("aria-haspopup", "true");
    dropdownButton.setAttribute("aria-expanded", "false");

    let dropdownTitle = document.createElement("span");
    dropdownTitle.id = "dropdown-reserved-title-" + index;
    dropdownTitle.textContent = selectedPlan ? selectedPlan.name : "";
    dropdownButton.appendChild(dropdownTitle);

    let dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu dropdown-menu-reserved";
    dropdownMenu.setAttribute("aria-labelledby", dropdownButton.id);

    let dropdownItemlist = document.createElement("div");
    dropdownItemlist.id = "dropdown-itemlist-" + index;
    dropdownItemlist.setAttribute("value", selectedPlanIndex);
    dropdownMenu.appendChild(dropdownItemlist);
    dropdown.appendChild(dropdownButton);
    dropdown.appendChild(dropdownMenu);

    let cycleInput = document.createElement("input");
    cycleInput.type = "number";
    cycleInput.id = "reserved-cycle-" + index;
    cycleInput.className = "reserved-cycle";
    cycleInput.value = item.cycle == null ? "" : String(item.cycle);
    cycleInput.style.imeMode = "Disabled";
    cycleInput.addEventListener("change", function () { reservedEdit(index); });
    cycleInput.addEventListener("input", function () {
        cycleInput.value = cycleInput.value.replace(/[89e.-]+/g, "").slice(0, 7);
    });

    let deleter = document.createElement("span");
    deleter.id = "deleter" + index;
    let deleteLink = document.createElement("a");
    deleteLink.href = "#";
    deleteLink.className = "work underlined";
    deleteLink.textContent = i18n.__("delete");
    deleteLink.addEventListener("click", function (event) {
        event.preventDefault();
        reservedErase(index);
    });
    deleter.appendChild(deleteLink);

    li.appendChild(document.createTextNode(i18n.__("task-reservation-time-setting") + " "));
    li.appendChild(timeInput);
    li.appendChild(document.createElement("br"));
    li.appendChild(document.createTextNode(i18n.__("task-reservation-follow-plan")));
    li.appendChild(dropdown);
    li.appendChild(document.createElement("br"));
    li.appendChild(document.createTextNode(i18n.__("task-reservation-cycle")));
    li.appendChild(cycleInput);
    li.appendChild(document.createElement("br"));
    li.appendChild(deleter);
    li.appendChild(document.createElement("hr"));
    document.getElementById("reservation-list").appendChild(li);

    reservedUseDefaultArray.forEach(function (defaultArrayItem, defaultArrayIndex) {
        let planLink = document.createElement("a");
        planLink.className = "dropdown-item";
        planLink.setAttribute("value", defaultArrayIndex);
        planLink.href = "#";
        planLink.textContent = defaultArrayItem.name;
        planLink.addEventListener("click", function (event) {
            event.preventDefault();
            reservedEditDropdownTrigger(index, defaultArrayIndex);
        });
        dropdownItemlist.appendChild(planLink);
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
    if (store.has("custom-work-time-end-sound"))
        $("#custom-notify-sound-work-time-end").val(store.get("custom-work-time-end-sound"));
    if (store.has("custom-rest-time-end-sound"))
        $("#custom-notify-sound-rest-time-end").val(store.get("custom-rest-time-end-sound"));
    if (store.has("custom-all-time-end-sound"))
        $("#custom-notify-sound-all-time-end").val(store.get("custom-all-time-end-sound"));
    let player = document.createElement("audio");//alert player
    let soundList = ['alarming', 'beep', 'clock', 'tick', 'trumpet', 'whistle', 'horns', 'magic', 'piano', i18n.__('custom')];
    for (let i in soundList) {
        $("#work-time-end-sound-select").append("\
                    <a class='dropdown-item' href='javascript:workTimeEndSoundSetting(\"" + soundList[i] + "\")'>"
            + soundList[i] + "</a>");
    }
    for (let i in soundList) {
        $("#rest-time-end-sound-select").append("\
                    <a class='dropdown-item' href='javascript:restTimeEndSoundSetting(\"" + soundList[i] + "\")'>"
            + soundList[i] + "</a>");
    }
    for (let i in soundList) {
        $("#all-time-end-sound-select").append("\
                    <a class='dropdown-item' href='javascript:allTimeEndSoundSetting(\"" + soundList[i] + "\")'>"
            + soundList[i] + "</a>");
    }

    let workSelection = store.has("work-time-end-sound") ? store.get("work-time-end-sound")
        : (store.has("time-end-sound") ? store.get("time-end-sound") : "tick");
    $("#work-time-end-sound-dropdown-button").text(workSelection);
    if (workSelection === i18n.__('custom'))
        $(".custom-notify-sound-work-time-end").css("display", "inline-block");
    else
        $(".custom-notify-sound-work-time-end").css("display", "none");

    let restSelection = store.has("rest-time-end-sound") ? store.get("rest-time-end-sound")
        : (store.has("time-end-sound") ? store.get("time-end-sound") : "tick");
    $("#rest-time-end-sound-dropdown-button").text(restSelection);
    if (restSelection === i18n.__('custom'))
        $(".custom-notify-sound-rest-time-end").css("display", "inline-block");
    else
        $(".custom-notify-sound-rest-time-end").css("display", "none");

    let allSelection = store.has("all-end-sound") ? store.get("all-end-sound") : "piano";
    $("#all-time-end-sound-dropdown-button").text(allSelection);
    if (allSelection === i18n.__('custom'))
        $(".custom-notify-sound-all-time-end").css("display", "inline-block");
    else
        $(".custom-notify-sound-all-time-end").css("display", "none");
}

function workTimeEndSoundSetting(val) {
    store.set("work-time-end-sound", val);
    store.set("time-end-sound", val);
    $("#work-time-end-sound-dropdown-button").text(val);
    if (val !== i18n.__('custom'))
        try {
            $(".custom-notify-sound-work-time-end").css("display", "none");
            let player = document.createElement("audio");//alert player
            player.src = path.join(__dirname, "\\res\\sound\\" + val + ".mp3");
            player.loop = false;
            player.play();
        } catch (e) {
            console.log(e);
        }
    else
        $(".custom-notify-sound-work-time-end").css("display", "inline-block");
}

function restTimeEndSoundSetting(val) {
    store.set("rest-time-end-sound", val);
    $("#rest-time-end-sound-dropdown-button").text(val);
    if (val !== i18n.__('custom'))
        try {
            $(".custom-notify-sound-rest-time-end").css("display", "none");
            let player = document.createElement("audio");//alert player
            player.src = path.join(__dirname, "\\res\\sound\\" + val + ".mp3");
            player.loop = false;
            player.play();
        } catch (e) {
            console.log(e);
        }
    else
        $(".custom-notify-sound-rest-time-end").css("display", "inline-block");
}

function allTimeEndSoundSetting(val) {
    store.set("all-end-sound", val);
    $("#all-time-end-sound-dropdown-button").text(val);
    if (val !== i18n.__('custom'))
        try {
            $(".custom-notify-sound-all-time-end").css("display", "none");
            let player = document.createElement("audio");//alert player
            player.src = path.join(__dirname, "\\res\\sound\\" + val + ".mp3");
            player.loop = false;
            player.play();
        } catch (e) {
            console.log(e);
        }
    else
        $(".custom-notify-sound-all-time-end").css("display", "inline-block");
}

//language settings
function languageInitializer() {
    for (let i in languageList) {
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
        store.set("previous-language", store.get('i18n'));
        store.set("i18n", val);
        for (let i in languageList) {
            if (languageList[i] === val) $("#language-dropdown-button").text(languageNameList[i]);
        }
        requestSettingsRelaunch();
    }
}

// theme color
let themeColorList = store.get("theme-color");
let colorNameList = [i18n.__("theme-color-rest"), i18n.__("theme-color-work"), i18n.__("theme-color-positive"), i18n.__("theme-color-onlyrest")];
let JSColor = require("@eastdesire/jscolor");

function colorSet(id) {
    ipc.send("logger", $("#color-" + id).val());
    themeColorList[id] = $("#color-" + id).val();
    store.set("theme-color", themeColorList);
    ipc.send("theme-color-changed");
}

function colorInitializer() {
    for (let i in themeColorList) {
        $("#color-box").append("\
                <div class=\"col-6\">\
                <label id = \"color-label-" + i + "\" class= \"hotkey-set-label text-muted settings-msg\" ></label>\
                </div><div class=\"col-6\">\
            <input id=\"color-" + i + "\" class=\"hotkey-set-input extreme-small\" data-jscolor=\"\" value=\"" + themeColorList[i] + "\" onchange=\"colorSet(" + i + ")\" /></div><br />");
        $("#color-label-" + i).text(colorNameList[i]);
    }

    if (JSColor && typeof JSColor.install === "function") {
        JSColor.install();
    }

    for (let i in themeColorList) {
        let element = document.getElementById("color-" + i);
        if (element && element.jscolor) {
            element.jscolor.fromString(themeColorList[i]);
        }
    }
}

function resetThemeColors() {
    const defaultColors = [
        "#5490ea",
        "#ea5454",
        "#17a2b8",
        "#a26ae5"
    ];
    themeColorList = defaultColors;
    store.set("theme-color", themeColorList);
    $("#color-box").empty();
    colorInitializer();
    ipc.send("theme-color-changed");
}

// hotkey
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
            if (process.platform !== "linux")
                autostartAfter(store.has("autostart") ? store.get("autostart") : false);
            setTimeout(() => ipc.send("relaunch-dialog"), 1500);
        }
    } catch (error) {
        ipc.send("alert", i18n.__('settings-import-error'));
        isAllRight = false;
        if (mode === "statistics") statistics.set(formerData);
        else store.set(formerData);
    }
}

async function getWebDavSyncConfigUiState() {
    return await ipc.invoke('webdav-config:getUiState');
}

function setWebDavSyncStatus(message, isError) {
    $("#webdav-sync-status")
        .text(message || '')
        .toggleClass("work", !!isError)
        .toggleClass("rest", !isError && !!message);
}

function setWebDavSyncDetail(detail) {
    const toggleContainer = $("#webdav-sync-detail-toggle-container");
    const detailBox = $("#webdav-sync-detail");
    const toggle = $("#webdav-sync-detail-toggle");
    const text = detail || '';

    if (text === '') {
        toggleContainer.addClass("d-none");
        detailBox.addClass("d-none").text('');
        toggle.text(i18n.__('webdav-sync-show-details'));
        return;
    }

    toggleContainer.removeClass("d-none");
    detailBox.text(text).addClass("d-none");
    toggle.text(i18n.__('webdav-sync-show-details'));
}

function toggleWebDavSyncDetails() {
    const detailBox = $("#webdav-sync-detail");
    const toggle = $("#webdav-sync-detail-toggle");
    const hidden = detailBox.hasClass("d-none");
    detailBox.toggleClass("d-none", !hidden);
    toggle.text(i18n.__(hidden ? 'webdav-sync-hide-details' : 'webdav-sync-show-details'));
}

function setWebDavSyncRuntimeStatus(data) {
    const enabledToggle = $("#selection-webdav-sync-enabled");
    enabledToggle.prop('disabled', !data || data.configured !== true);
    enabledToggle.prop('checked', !!(data && data.configured === true && data.enabled === true));

    if (!data || data.configured !== true) {
        $("#webdav-sync-auto-status").text(i18n.__('webdav-sync-auto-disabled'));
        $("#webdav-sync-startup-status").text('');
        $("#webdav-sync-push-status").text('');
        setWebDavSyncDetail('');
        return;
    }

    if (data.enabled !== true) {
        $("#webdav-sync-auto-status").text(i18n.__('webdav-sync-user-disabled'));
        $("#webdav-sync-startup-status").text('');
        $("#webdav-sync-push-status").text('');
        setWebDavSyncDetail('');
        return;
    }

    $("#webdav-sync-auto-status").text(
        data.autoReady
            ? i18n.__('webdav-sync-auto-enabled')
            : i18n.__('webdav-sync-auto-awaiting-initial-sync')
    );
    $("#webdav-sync-startup-status").text(
        data.startupPull && data.startupPull.message
            ? i18n.__('webdav-sync-startup-status') + data.startupPull.message
            : ''
    );
    $("#webdav-sync-push-status").text(
        data.lastPush && data.lastPush.message
            ? i18n.__('webdav-sync-last-push-status') + data.lastPush.message
            : ''
    );
    setWebDavSyncDetail(data.latestFailureDetail || '');
}

async function refreshWebDavSyncRuntimeStatus() {
    let status = await ipc.invoke('webdav-sync-status');
    setWebDavSyncRuntimeStatus(status);
}

let webDavPasswordPersistPromise = Promise.resolve();
let webDavPasswordPersistTimer = null;
let webDavPasswordDirty = false;

function scheduleWebDavPasswordPersist() {
    webDavPasswordDirty = true;
    if (webDavPasswordPersistTimer != null) clearTimeout(webDavPasswordPersistTimer);
    webDavPasswordPersistTimer = setTimeout(function () {
        flushPendingWebDavPasswordInput().catch(function (error) {
            console.error('Failed to persist pending WebDAV password', error);
        });
    }, 250);
}

async function flushPendingWebDavPasswordInput() {
    let passwordInput = $("#webdav-sync-password");
    if (passwordInput.length === 0) return;

    if (webDavPasswordPersistTimer != null) {
        clearTimeout(webDavPasswordPersistTimer);
        webDavPasswordPersistTimer = null;
    }

    if (!webDavPasswordDirty) {
        await webDavPasswordPersistPromise;
        return;
    }

    const persist = async function () {
        await handleWebDavPasswordInput();
        webDavPasswordDirty = false;
    };

    webDavPasswordPersistPromise = webDavPasswordPersistPromise.then(persist, persist);
    await webDavPasswordPersistPromise;
}

async function ensureWebDavConfigComplete() {
    await flushPendingWebDavPasswordInput();

    let config = await getWebDavSyncConfigUiState();
    let isComplete = String(config.url || '').trim() !== ''
        && String(config.username || '').trim() !== ''
        && config.hasPassword === true;

    if (isComplete) return true;

    let message = i18n.__('webdav-sync-missing-config');
    setWebDavSyncStatus(message, true);
    setWebDavSyncDetail('');
    ipc.send("alert", message);
    return false;
}

async function handleWebDavConfigInput() {
    try {
        await ipc.invoke('webdav-config:setNonSensitive', {
            url: $("#webdav-sync-url").val(),
            username: $("#webdav-sync-username").val(),
            remotePath: $("#webdav-sync-remote-path").val()
        });
        await refreshWebDavSyncRuntimeStatus();
    } catch (error) {
        console.error('Failed to save WebDAV configuration', error);
        setWebDavSyncStatus(error && error.message ? error.message : i18n.__('webdav-sync-connection-failed'), true);
    }
}

async function handleWebDavEnabledToggle() {
    try {
        if (!(await ensureWebDavConfigComplete())) {
            $("#selection-webdav-sync-enabled").prop('checked', false);
            return;
        }

        await ipc.invoke('webdav-config:setEnabled', {
            enabled: $("#selection-webdav-sync-enabled").prop('checked')
        });
        await refreshWebDavSyncRuntimeStatus();
    } catch (error) {
        console.error('Failed to toggle WebDAV sync', error);
        setWebDavSyncStatus(error && error.message ? error.message : i18n.__('webdav-sync-connection-failed'), true);
    }
}

async function handleWebDavPasswordInput() {
    try {
        let passwordInput = $("#webdav-sync-password");
        let password = String(passwordInput.val() || '');
        if (password === '') {
            await ipc.invoke('webdav-config:clearPassword');
        } else {
            await ipc.invoke('webdav-config:setPassword', {
                password: password
            });
        }
        await refreshWebDavSyncRuntimeStatus();
    } catch (error) {
        console.error('Failed to save WebDAV password', error);
        setWebDavSyncStatus(error && error.message ? error.message : i18n.__('webdav-sync-connection-failed'), true);
    }
}

async function webDavSyncInitializer() {
    let config = await getWebDavSyncConfigUiState();
    $("#webdav-sync-url").val(config.url).on("input", function () {
        handleWebDavConfigInput();
    });
    $("#webdav-sync-username").val(config.username).on("input", function () {
        handleWebDavConfigInput();
    });
    $("#webdav-sync-password").val('').attr('placeholder', config.hasPassword ? '••••••••' : '').on("input", function () {
        scheduleWebDavPasswordPersist();
    });
    $("#webdav-sync-remote-path").val(config.remotePath).on("input", function () {
        handleWebDavConfigInput();
    });
    $("#selection-webdav-sync-enabled")
        .prop('checked', config.enabled === true)
        .on("click", function () {
            handleWebDavEnabledToggle();
        });
    setWebDavSyncStatus('');
    setWebDavSyncDetail('');
    await refreshWebDavSyncRuntimeStatus();
}

async function webDavSyncTest() {
    await flushPendingWebDavPasswordInput();
    setWebDavSyncStatus(i18n.__('webdav-sync-testing'), false);
    let result = await ipc.invoke('webdav-sync-test');
    setWebDavSyncStatus(result.message, !result.ok);
    setWebDavSyncDetail(result.detail || '');
    await refreshWebDavSyncRuntimeStatus();
    if (!result.ok) ipc.send("alert", result.message);
    else ipc.send("notify", result.message);
}

async function webDavSyncUpload() {
    if (!(await ensureWebDavConfigComplete())) return;

    setWebDavSyncStatus(i18n.__('webdav-sync-uploading'), false);
    let result = await ipc.invoke('webdav-sync-upload', { confirmOverwrite: false });
    if (result.needsConfirm) {
        let overwriteMessage = i18n.__('webdav-sync-confirm-upload');
        if (result.existingFiles && result.existingFiles.length > 0) {
            overwriteMessage += '\n' + result.existingFiles.join(', ');
        }
        if (!window.confirm(overwriteMessage)) {
            await ipc.invoke('webdav-sync-cancel-overwrite-confirm');
            setWebDavSyncStatus('', false);
            await refreshWebDavSyncRuntimeStatus();
            return;
        }
        result = await ipc.invoke('webdav-sync-upload', { confirmOverwrite: true });
    }
    setWebDavSyncStatus(result.message, !result.ok);
    setWebDavSyncDetail(result.detail || '');
    await refreshWebDavSyncRuntimeStatus();
    if (!result.ok) ipc.send("alert", result.message);
    else ipc.send("notify", result.message);
}

async function webDavSyncDownload() {
    if (!(await ensureWebDavConfigComplete())) return;

    if (!window.confirm(i18n.__('webdav-sync-confirm-download'))) return;

    setWebDavSyncStatus(i18n.__('webdav-sync-downloading'), false);
    let result = await ipc.invoke('webdav-sync-download');
    setWebDavSyncStatus(result.message, !result.ok);
    setWebDavSyncDetail(result.detail || '');
    if (!result.ok) {
        ipc.send("alert", result.message);
        return;
    }
    ipc.send("notify", result.message);
    await refreshWebDavSyncRuntimeStatus();
    ipc.send("relaunch-dialog");
}

//locker
function lockerInitializer() {
    $('#passcode-locker, #passcode-locker-again').removeAttr('placeholder');
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
