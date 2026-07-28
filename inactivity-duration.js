'use strict';

function getAlarmtipDurationMs(store) {
    const idx = store.get('alarmtip-duration');
    const minutes = [3, 5, 10, 15, 20, 30, 60];
    if (idx === 7) {
        const custom = Number(store.get('alarmtip-duration-custom'));
        return (custom > 0 ? custom : 45) * 60 * 1000;
    }
    return ((idx >= 0 && idx < minutes.length) ? minutes[idx] : 10) * 60 * 1000;
}

module.exports = getAlarmtipDurationMs;
