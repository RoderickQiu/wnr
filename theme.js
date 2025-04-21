// Add dark theme support
(function() {
    // Check if dark mode is enabled in the store
    const isDarkMode = store.get("dark-mode") === true;
    
    // Apply dark-theme class if dark mode is enabled
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Update theme when dark mode setting changes
    ipc.on('theme-changed', function(event, isDark) {
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    });
})();

// Apply custom colors to dropdown elements
$('body').append(
    '<style class="theme-dropdown-colors">' +
    // Rest Time dropdown colors
    '   #rest-time-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: ' + newRestColor + ' !important;' +
    '   }' +
    '   #rest-time-presets-dropdown + .dropdown-menu .dropdown-item:hover,' +
    '   #rest-time-presets-dropdown + .dropdown-menu .dropdown-item:focus {' +
    '       background-color: ' + newRestColor + '20 !important;' +
    '   }' +
    // Work Time dropdown colors
    '   #work-time-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: ' + newWorkColor + ' !important;' +
    '   }' +
    '   #work-time-presets-dropdown + .dropdown-menu .dropdown-item:hover,' +
    '   #work-time-presets-dropdown + .dropdown-menu .dropdown-item:focus {' +
    '       background-color: ' + newWorkColor + '20 !important;' +
    '   }' +
    // OnlyRest Time dropdown colors
    '   #rest-time-onlyrest-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: ' + newOnlyRestColor + ' !important;' +
    '   }' +
    '   #rest-time-onlyrest-presets-dropdown + .dropdown-menu .dropdown-item:hover,' +
    '   #rest-time-onlyrest-presets-dropdown + .dropdown-menu .dropdown-item:focus {' +
    '       background-color: ' + newOnlyRestColor + '20 !important;' +
    '   }' +
    // Loop dropdown colors (Gray in both light/dark)
    '   #loop-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: #6c757d !important;' +
    '   }' +
    '   #loop-presets-dropdown + .dropdown-menu .dropdown-item:hover,' +
    '   #loop-presets-dropdown + .dropdown-menu .dropdown-item:focus {' +
    '       background-color: rgba(108, 117, 125, 0.1) !important;' +
    '   }' +
    // Dark mode adjustments
    '   .dark-theme #rest-time-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: ' + lightenColor(newRestColor, 20) + ' !important;' +
    '   }' +
    '   .dark-theme #work-time-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: ' + lightenColor(newWorkColor, 20) + ' !important;' +
    '   }' +
    '   .dark-theme #rest-time-onlyrest-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: ' + lightenColor(newOnlyRestColor, 20) + ' !important;' +
    '   }' +
    '   .dark-theme #loop-presets-dropdown + .dropdown-menu .dropdown-item {' +
    '       color: #b0b0b0 !important;' +
    '   }' +
    // Rest icon color
    '   #rest-time-presets-dropdown .icon-caret-down {' +
    '       color: ' + newRestColor + ' !important;' +
    '   }' +
    // Work icon color
    '   #work-time-presets-dropdown .icon-caret-down {' +
    '       color: ' + newWorkColor + ' !important;' +
    '   }' +
    // OnlyRest icon color
    '   #rest-time-onlyrest-presets-dropdown .icon-caret-down {' +
    '       color: ' + newOnlyRestColor + ' !important;' +
    '   }' +
    '</style>'
);

// Helper function to lighten colors for dark mode
function lightenColor(color, percent) {
    // If color is already a light color, return it as is
    if (!color) return '#ffffff';
    
    // Remove the '#' if present
    color = color.replace('#', '');
    
    // Parse the color to RGB
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    // Lighten the color
    r = Math.min(255, r + Math.floor(r * percent / 100));
    g = Math.min(255, g + Math.floor(g * percent / 100));
    b = Math.min(255, b + Math.floor(b * percent / 100));
    
    // Convert back to hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

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