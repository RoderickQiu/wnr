function isInDark() {
    const isDarkMode = store.get('isDarkMode');
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
    } else {
        $('body').append('<style>::-webkit-scrollbar-track {background-color: #fefefe;}</style>');
        $('body').append('<style>::-webkit-scrollbar-thumb {background-color: #5555558f;}</style>');
        $('body').append('<style>.dropdown-menu {border-color: #999999; background-color: #fefefe;}</style>');
        $('body').append('<style>.dropdown-item:hover {background-color: #007bff;}</style>');
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
})