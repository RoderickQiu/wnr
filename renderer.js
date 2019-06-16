const isDarkMode = store.get('isDarkMode');
if (isDarkMode) {
    document.write('<style>::-webkit-scrollbar-track {background-color: #393939;}</style>');
    document.write('<style>::-webkit-scrollbar-thumb {background-color: #999999;}</style>');
    document.write('<style>.dropdown-menu {border-color: #aaaaaa; background-color: #555555;}</style>');
    document.write('<style>.dropdown-item:hover {background-color: #aaaaaa;}</style>');
    document.write('<style>input[type="range"] {background-color: #aaaaaa33;}</style>');
    $('body').css('background-color', '#393939');
    $('body').css('color', '#aaaaaa');
    $('hr').css('border-color', '#666666');
    $('#title').css('color', '#aaaaaa');
}