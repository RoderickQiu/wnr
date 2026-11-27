'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const shi = require('node-shi');
const { normalizeDurationText } = require('../duration');

// the home fields read durations as minutes, like index.html does
const minutes = (raw) => shi.humanTimeParser(normalizeDurationText(raw), { as: 'm', to: 'm', ignoreError: true });

test('a decimal comma is a decimal point, not a thousands separator', () => {
    assert.equal(minutes('1,5 h'), 90);// node-shi alone reads 15 hours
    assert.equal(minutes('1,5'), 1.5);
    assert.equal(minutes('0,5 h'), 30);
    assert.equal(minutes('2,5 min'), 2.5);
    assert.equal(normalizeDurationText('1,5'), '1.5');
});

test('other input reads as before', () => {
    assert.equal(minutes('1.5 h'), 90);
    assert.equal(minutes('25'), 25);
    assert.equal(minutes('1 h 30 min'), 90);
    assert.equal(minutes('30 s'), 0.5);
    assert.equal(normalizeDurationText('1, 5'), '1, 5');// not between two digits
    assert.equal(normalizeDurationText(undefined), undefined);
    assert.equal(normalizeDurationText(null), null);
});

test('a bare number after hours is minutes', () => {
    assert.equal(minutes('1h30'), 90);// node-shi alone reads 60
    assert.equal(minutes('1 h 30'), 90);
    assert.equal(minutes('2hr15'), 135);
    assert.equal(minutes('1,5h'), 90);
    assert.equal(minutes('1小时30'), 90);
    assert.equal(minutes('1小時30'), 90);
    assert.equal(minutes('1h 30 min'), 90);// already has a unit
    assert.equal(minutes('1h 30s'), 60.5);
    assert.equal(minutes('30'), 30);
});

test('Traditional Chinese hours read as hours', () => {
    assert.equal(minutes('1小時'), 60);
    assert.equal(minutes('1鐘頭'), 60);
});
