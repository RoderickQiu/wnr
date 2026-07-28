'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const getAlarmtipDurationMs = require('../inactivity-duration');

function store(values) { return { get: function (key) { return values[key]; } }; }

test('uses the configured custom inactivity duration', function () {
    assert.equal(getAlarmtipDurationMs(store({ 'alarmtip-duration': 7, 'alarmtip-duration-custom': 27 })), 27 * 60 * 1000);
});

test('uses safe defaults for invalid durations', function () {
    assert.equal(getAlarmtipDurationMs(store({ 'alarmtip-duration': 7, 'alarmtip-duration-custom': 0 })), 45 * 60 * 1000);
    assert.equal(getAlarmtipDurationMs(store({ 'alarmtip-duration': 99 })), 10 * 60 * 1000);
});
