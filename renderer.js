function isLockMode() {
    const isLocked = store.get('islocked');
    if (isLocked) {
        $('.should-lock').css('display', 'none');
        $('#exit').css('display', 'none');
        $('#settings').css('display', 'none');
        $('#predefined-tasks-edit').css('display', 'none');
        $('#predefined-tasks-divider').css('display', 'none');
    }
}//lock mode settings
isLockMode()

if (store.get("is-shadowless")) {
    $('html').css('border', '#33333333 1px solid')
}

if (store.get("isdark")) {
    $('html').css('border', '#ffffff33 1px solid')
}