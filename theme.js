$('body').append(
    '<style class="theme-rest-jetplane">' +
    '   input[type="range"]::-webkit-slider-thumb, .switch-slide input:checked + label {' +
    '       background: ' + newRestColor + ';' +
    '   }' +
    '   input[type="checkbox"]::after, .rest, .rest::-webkit-input-placeholder, .rest:hover, #controller .dropdown-toggle::before, #controller .dropdown-toggle::after {' +
    '       color: ' + newRestColor + ';' +
    '   }' +
    '   select > option:focus {' +
    '       background-color: ' + newRestColor + ';' +
    '   }' +
    '   .rest:focus::-webkit-input-placeholder, .rest:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newRestColor + 'c2;\n' +
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
    '<style class="theme-rest-jetplane">' +
    '   #focus-work-set::after, #focus-work-set:checked::after, .work, .work::-webkit-input-placeholder, .work:hover {\n' +
    '       color: ' + newWorkColor + ';\n' +
    '   }' +
    '   .work:focus::-webkit-input-placeholder, .work:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newWorkColor + 'c2;\n' +
    '   }' +
    '</style>'
)

$("body").append(
    '<style class="theme-positive-jetplane">' +
    '   .positive, .positive::-webkit-input-placeholder, .positive:hover {\n' +
    '       color: ' + newPositiveColor + ' !important;\n' +
    '   }\n' +
    '   .positive:focus::-webkit-input-placeholder, .positive:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newPositiveColor + ' !important;\n' +
    '   }' +
    '</style>'
)

$("body").append(
    '<style class="theme-onlyrest-jetplane">' +
    '   #focus-rest-set-onlyrest::after, #focus-rest-set-onlyrest:checked::after,\n' +
    '   #focus-continueloop-set-onlyrest::after, #focus-continueloop-set-onlyrest:checked::after {\n' +
    '       color: ' + newOnlyRestColor + ';\n' +
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
    '   .onlyRest, .onlyRest::-webkit-input-placeholder, .onlyRest:hover {\n' +
    '       color: ' + newOnlyRestColor + ';\n' +
    '   }\n' +
    '   .onlyRest:focus::-webkit-input-placeholder, .onlyRest:hover::-webkit-input-placeholder {\n' +
    '       color: ' + newOnlyRestColor + ';\n' +
    '   }' +
    '</style>'
)