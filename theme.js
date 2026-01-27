function reloadTheme() {
    $('.theme-rest-jetplane, .theme-work-jetplane, .theme-positive-jetplane, .theme-onlyrest-jetplane').remove();
    newRestColor = store.get("theme-color")[0];
    newWorkColor = store.get("theme-color")[1];
    newPositiveColor = store.get("theme-color")[2];
    newOnlyRestColor = store.get("theme-color")[3];
    applyTheme();
}

function applyTheme() {
$('body').append(
    '<style class="theme-rest-jetplane">' +
    '   input[type="range"]::-webkit-slider-thumb, .switch-slide input:checked + label, .rest input[type="range"]::-webkit-slider-thumb {' +
    '       background: ' + newRestColor + ';' +
    '   }' +
    '   input[type="checkbox"]::after, .rest, .rest::-webkit-input-placeholder, .rest:hover, #controller .dropdown-toggle::before, #controller .dropdown-toggle::after, .rest input[type="checkbox"]::after, #rest-time, #work-rest.rest, #now-timing.rest, #fullscreen-experience-tip .rest, #fullscreen-too-long-tip .rest, .rest .iconfont, #external.rest, #external.rest .iconfont, #time-left.rest, #time-left-msg.rest, #floating-container .rest, #floating-container .rest .iconfont {' +
    '       color: ' + newRestColor + ' !important;' +
    '   }' +
    '   select > option:focus {' +
    '       background-color: ' + newRestColor + ';' +
    '   }' +
    '   .rest:focus::-webkit-input-placeholder, .rest:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newRestColor + 'c2 !important;\n' +
    '   }' +
    '   .btn-primary, .btn-outline-primary {\n' +
    '       color: ' + newRestColor + ';\n' +
    '       border-color: ' + newRestColor + ';\n' +
    '   }\n' +
    '   .btn-primary:hover, .btn-outline-primary:hover {\n' +
    '       background-color: ' + newRestColor + ';\n' +
    '       border-color: ' + newRestColor + ';' +
    '       color: #fff !important;\n' +
    '   }' +
    '</style>'
);

$("body").append(
    '<style class="theme-work-jetplane">' +
    '   #focus-work-set::after, #focus-work-set:checked::after, .work, .work::-webkit-input-placeholder, .work:hover, #work-time, #work-rest, #now-timing, #external, #external .iconfont, .work .iconfont, #time-left.work, #time-left-msg.work, #floating-container .work, #floating-container .work .iconfont {\n' +
    '       color: ' + newWorkColor + ' !important;\n' +
    '   }' +
    '   .work:focus::-webkit-input-placeholder, .work:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newWorkColor + 'c2 !important;\n' +
    '   }' +
    '   .work input[type="range"]::-webkit-slider-thumb, .work input[type="checkbox"]::after {\n' +
    '       background: ' + newWorkColor + ';\n' +
    '       color: ' + newWorkColor + ';\n' +
    '   }' +
    '</style>'
)

$("body").append(
    '<style class="theme-positive-jetplane">' +
    '   .positive, .positive::-webkit-input-placeholder, .positive:hover, #work-rest.positive, #now-timing.positive, #external.positive, #external.positive .iconfont, .positive .iconfont, #time-left.positive, #time-left-msg.positive, #floating-container .positive, #floating-container .positive .iconfont {\n' +
    '       color: ' + newPositiveColor + ' !important;\n' +
    '   }\n' +
    '   .positive:focus::-webkit-input-placeholder, .positive:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newPositiveColor + ' !important;\n' +
    '   }\n' +
    '   .positive input[type="range"]::-webkit-slider-thumb {\n' +
    '       background: ' + newPositiveColor + ' !important;\n' +
    '   }\n' +
    '   .positive input[type="checkbox"]::after {\n' +
    '       color: ' + newPositiveColor + ' !important;\n' +
    '   }' +
    '</style>'
)

$("body").append(
    '<style class="theme-onlyrest-jetplane">' +
    '   #focus-rest-set-onlyrest::after, #focus-rest-set-onlyrest:checked::after,\n' +
    '   #focus-continueloop-set-onlyrest::after, #focus-continueloop-set-onlyrest:checked::after {\n' +
    '       color: ' + newOnlyRestColor + ' !important;\n' +
    '   }' +
    '   .btn-onlyRest {\n' +
    '       color: ' + newOnlyRestColor + ';\n' +
    '       border-color: ' + newOnlyRestColor + ';\n' +
    '   }' +
    '   .btn-onlyRest:hover {\n' +
    '       color: #fff;\n' +
    '       background-color: ' + newOnlyRestColor + ';\n' +
    '       border-color: ' + newOnlyRestColor + ';\n' +
    '   }' +
    '   .onlyRest, .onlyRest::-webkit-input-placeholder, .onlyRest:hover, .rest.onlyRest, .rest.onlyRest::-webkit-input-placeholder, .rest.onlyRest:hover, #work-rest.onlyRest, #now-timing.onlyRest, #work-rest.rest.onlyRest, #now-timing.rest.onlyRest, #external.onlyRest, #external.rest.onlyRest, #external.onlyRest .iconfont, #external.rest.onlyRest .iconfont, .onlyRest .iconfont, .rest.onlyRest .iconfont, #time-left.onlyRest, #time-left.rest.onlyRest, #time-left-msg.onlyRest, #time-left-msg.rest.onlyRest, #floating-container .onlyRest, #floating-container .rest.onlyRest, #floating-container .onlyRest .iconfont, #floating-container .rest.onlyRest .iconfont {\n' +
    '       color: ' + newOnlyRestColor + ' !important;\n' +
    '   }\n' +
    '   .onlyRest:focus::-webkit-input-placeholder, .onlyRest:hover::-webkit-input-placeholder, .rest.onlyRest:focus::-webkit-input-placeholder, .rest.onlyRest:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newOnlyRestColor + ' !important;\n' +
    '   }\n' +
    '   .onlyRest input[type="range"]::-webkit-slider-thumb, .rest.onlyRest input[type="range"]::-webkit-slider-thumb {\n' +
    '       background: ' + newOnlyRestColor + ' !important;\n' +
    '   }\n' +
    '   .onlyRest input[type="checkbox"]::after, .rest.onlyRest input[type="checkbox"]::after {\n' +
    '       color: ' + newOnlyRestColor + ' !important;\n' +
    '   }' +
    '</style>'
);
}

applyTheme();

if (typeof ipc !== 'undefined') {
    ipc.on('theme-color-changed', function () {
        reloadTheme();
    });
}