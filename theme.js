// Phase colours are custom properties; the rules that use them live in style.css.
function applyTheme() {
    const root = document.documentElement;
    root.style.setProperty('--rest', newRestColor);
    root.style.setProperty('--work', newWorkColor);
    root.style.setProperty('--positive', newPositiveColor);
    root.style.setProperty('--only-rest', newOnlyRestColor);
    root.setAttribute('data-phase-colors', '');
}

function reloadTheme() {
    newRestColor = store.get("theme-color")[0];
    newWorkColor = store.get("theme-color")[1];
    newPositiveColor = store.get("theme-color")[2];
    newOnlyRestColor = store.get("theme-color")[3];
    applyTheme();
}

applyTheme();

if (typeof ipc !== 'undefined') {
    ipc.on('theme-color-changed', function () {
        reloadTheme();
    });
}
