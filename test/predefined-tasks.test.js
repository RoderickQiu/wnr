'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    sanitizeTaskName,
    sanitizePredefinedTasks,
    isValidRemotePredefinedTasks,
    sanitizeDefaultTaskIndex,
    remapDefaultTaskIndex,
    persistSanitizedPredefinedTasks,
    PREDEFINED_TASK_NAME_MAX_LENGTH
} = require('../predefined-tasks');
const { _test } = require('../webdav-sync');

function memoryStore(initial) {
    let data = JSON.parse(JSON.stringify(initial || {}));
    return {
        path: '', get store() { return data; },
        get: (key, fallback) => data[key] === undefined ? fallback : data[key],
        set: function (key, value) { if (arguments.length === 1) data = JSON.parse(JSON.stringify(key)); else data[key] = value; },
        clear: () => { data = {}; }, has: key => data[key] !== undefined, delete: key => { delete data[key]; }
    };
}

const validTask = {
    name: 'pomodoro',
    workTime: 25,
    restTime: 5,
    loops: 4,
    focusWhenWorking: false,
    focusWhenResting: true
};

test('sanitizeTaskName strips controls and truncates', function () {
    assert.equal(sanitizeTaskName('  hello\u0000world  '), 'helloworld');
    assert.equal(sanitizeTaskName('<img src=x onerror=1>'), '<img src=x onerror=1>');
    assert.equal(sanitizeTaskName(1), '');
    assert.equal(sanitizeTaskName('a'.repeat(PREDEFINED_TASK_NAME_MAX_LENGTH + 8)).length, PREDEFINED_TASK_NAME_MAX_LENGTH);
});

test('sanitizePredefinedTasks keeps only well-shaped tasks', function () {
    assert.deepEqual(sanitizePredefinedTasks(null), []);
    assert.deepEqual(sanitizePredefinedTasks([{ name: 'ok', workTime: '30', restTime: '10', loops: '4' }]), [{
        name: 'ok',
        workTime: 30,
        restTime: 10,
        loops: 4,
        focusWhenWorking: false,
        focusWhenResting: false
    }]);
    assert.deepEqual(sanitizePredefinedTasks([{ name: '', workTime: 30, restTime: 10, loops: 4 }]), []);
});

test('remote predefined-tasks schema rejects unsafe structures', function () {
    assert.equal(isValidRemotePredefinedTasks(undefined), true);
    assert.equal(isValidRemotePredefinedTasks([validTask]), true);
    assert.equal(isValidRemotePredefinedTasks({ name: 'nope' }), false);
    assert.equal(isValidRemotePredefinedTasks([{ ...validTask, name: 12 }]), false);
    assert.equal(isValidRemotePredefinedTasks([{ ...validTask, name: 'a'.repeat(PREDEFINED_TASK_NAME_MAX_LENGTH + 1) }]), false);
    assert.equal(isValidRemotePredefinedTasks([{ ...validTask, workTime: 'not-a-number' }]), false);
});

test('assertRemoteStorePayloads rejects invalid predefined-tasks', function () {
    const ok = { config: { 'predefined-tasks': [validTask] }, statistics: {}, recap: {} };
    assert.doesNotThrow(() => _test.assertRemoteStorePayloads(ok, 'invalid'));
    assert.throws(() => _test.assertRemoteStorePayloads({
        config: { 'predefined-tasks': 'xss' }, statistics: {}, recap: {}
    }, 'invalid'), /invalid/);
    assert.throws(() => _test.assertRemoteStorePayloads({
        config: { 'predefined-tasks': [{ ...validTask, name: { html: '<img>' } }] }, statistics: {}, recap: {}
    }, 'invalid'), /invalid/);
});

test('applying remote config sanitizes predefined-tasks before write', function () {
    const config = memoryStore({ local: true, 'webdav-sync': { url: 'https://dav' } });
    const statistics = memoryStore({ count: 1 });
    const recap = memoryStore({ old: true });
    _test.applyRemoteWebDavPayloadsToStores({ store: config, statistics, recapStore: recap }, {
        config: {
            'predefined-tasks': [{
                name: '  plan\u0007 ',
                workTime: '25',
                restTime: 5,
                loops: 4,
                focusWhenWorking: 1,
                focusWhenResting: 0
            }],
            'default-task': 0
        },
        statistics: { count: 2 },
        recap: { old: false }
    });
    assert.deepEqual(config.get('predefined-tasks'), [{
        name: 'plan',
        workTime: 25,
        restTime: 5,
        loops: 4,
        focusWhenWorking: false,
        focusWhenResting: false
    }]);
    assert.equal(config.get('default-task'), 0);
});

test('persistSanitizedPredefinedTasks rewrites stored tasks and default index', function () {
    const store = memoryStore({
        'predefined-tasks': [{ name: 'ok', workTime: 25, restTime: 5, loops: 4 }],
        'default-task': 9
    });
    persistSanitizedPredefinedTasks(store);
    assert.equal(store.get('default-task'), -1);
    assert.equal(store.get('predefined-tasks')[0].name, 'ok');
    assert.equal(sanitizeDefaultTaskIndex(0, 1), 0);
});

const taskA = { name: 'A', workTime: 25, restTime: 5, loops: 4, focusWhenWorking: false, focusWhenResting: false };
const taskB = { name: 'B', workTime: 20, restTime: 5, loops: 3, focusWhenWorking: false, focusWhenResting: false };
const badTask = { name: '', workTime: 25, restTime: 5, loops: 4 };

test('remapDefaultTaskIndex follows the same plan when earlier items are dropped', function () {
    assert.equal(remapDefaultTaskIndex([taskA, badTask, taskB], 2), 1);
    assert.equal(remapDefaultTaskIndex([badTask, taskA, taskB], 1), 0);
    assert.equal(remapDefaultTaskIndex([taskA, badTask, taskB], 0), 0);
    assert.equal(remapDefaultTaskIndex([taskA, taskB], 1), 1);
    assert.equal(remapDefaultTaskIndex([badTask, taskA], 0), -1);
    assert.equal(remapDefaultTaskIndex([taskA, taskB], -1), -1);
});

test('persist and WebDAV apply keep the default on the same remaining plan', function () {
    const store = memoryStore({
        'predefined-tasks': [taskA, badTask, taskB],
        'default-task': 2
    });
    persistSanitizedPredefinedTasks(store);
    assert.deepEqual(store.get('predefined-tasks').map(task => task.name), ['A', 'B']);
    assert.equal(store.get('default-task'), 1);

    const config = memoryStore({ 'webdav-sync': { url: 'https://dav' } });
    const statistics = memoryStore({});
    const recap = memoryStore({});
    _test.applyRemoteWebDavPayloadsToStores({ store: config, statistics, recapStore: recap }, {
        config: {
            'predefined-tasks': [badTask, taskA, taskB],
            'default-task': 1
        },
        statistics: {},
        recap: {}
    });
    assert.deepEqual(config.get('predefined-tasks').map(task => task.name), ['A', 'B']);
    assert.equal(config.get('default-task'), 0);
});
