// Pages cross-fade through @view-transition in style.css. When Chromium skips a transition (the
// new page took too long to render, the window was hidden...), its promises reject, and with no
// handler that shows up as an uncaught "Transition was skipped" error. Skipping is harmless here.
// Loaded in <head>, because pagereveal fires before the first frame.
(function () {
    function settle(transition) {
        if (!transition) return;
        ['ready', 'finished', 'updateCallbackDone'].forEach(function (name) {
            if (transition[name] && typeof transition[name].catch === 'function') transition[name].catch(function () {});
        });
    }
    window.addEventListener('pageswap', function (e) { settle(e.viewTransition); });
    window.addEventListener('pagereveal', function (e) { settle(e.viewTransition); });
    // a transition can also be skipped before either event hands it over; only that exact error is ignored
    window.addEventListener('unhandledrejection', function (e) {
        var reason = e.reason;
        if (reason && reason.name === 'AbortError' && /Transition was skipped/.test(String(reason.message))) e.preventDefault();
    });
})();
