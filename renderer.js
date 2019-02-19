function isTimerWindow(isTimer) {
    if (isTimer) {
        ipc.send('timer-win', true);
    } else ipc.send('timer-win', false);
}