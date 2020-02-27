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