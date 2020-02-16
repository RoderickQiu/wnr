function isInDark() {
    const isDarkMode = store.get('isdark');
    if (isDarkMode) {
        $('body').append('<style>::-webkit-scrollbar-track {background-color: #393939;}</style>');
        $('body').append('<style>::-webkit-scrollbar-thumb {background-color: #999999;}</style>');
        $('body').append('<style>.dropdown-menu {border-color: #aaaaaa; background-color: #555555;}</style>');
        $('body').append('<style>.dropdown-item:hover {background-color: #aaaaaa;}</style>');
        $('body').append('<style>input[type="range"] {background-color: #aaaaaa33;}</style>');
        $('body').css('background-color', '#393939');
        $('body').css('color', '#aaaaaa');
        $('hr').css('border-color', '#666666');
        $('#title').css('color', '#aaaaaa');
        $('.settings-sidebar-block').css('color', '#fefefe');
        $('.settings-sidebar-block').css('background-color', '#393939');
    } else {
        $('body').append('<style>::-webkit-scrollbar-track {background-color: #fefefe;}</style>');
        $('body').append('<style>::-webkit-scrollbar-thumb {background-color: #5555558f;}</style>');
        $('body').append('<style>.dropdown-menu {border-color: #999999; background-color: #fefefe;}</style>');
        $('body').append('<style>.dropdown-item:hover {background-color: #5490ea;}</style>');
        $('body').append('<style>input[type="range"] {background-color: #33333333;}</style>');
        $('body').css('background-color', '#fefefe');
        $('body').css('color', '#000000');
        $('hr').css('border-color', '#f1f1f1');
        $('#title').css('color', '#000000');
    }
}
isInDark();
ipc.on('darkModeChanges', function () {
    isInDark();
})//dark mode settings

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