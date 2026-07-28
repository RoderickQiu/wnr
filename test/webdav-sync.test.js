'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createWebDavSyncService, _test } = require('../webdav-sync');

function memoryStore(initial) {
    let data = JSON.parse(JSON.stringify(initial || {}));
    return {
        path: '', get store() { return data; },
        get: (key, fallback) => data[key] === undefined ? fallback : data[key],
        set: function (key, value) { if (arguments.length === 1) data = JSON.parse(JSON.stringify(key)); else data[key] = value; },
        clear: () => { data = {}; }, has: key => data[key] !== undefined, delete: key => { delete data[key]; }
    };
}

test('rolls all stores back if applying one remote store fails', function () {
    const config = memoryStore({ local: true, 'webdav-sync': { url: 'https://dav' } });
    const statistics = memoryStore({ count: 1 });
    const recap = memoryStore({ old: true });
    const originalSet = statistics.set;
    statistics.set = function () { originalSet.apply(null, arguments); throw new Error('disk failure'); };
    assert.throws(() => _test.applyRemoteWebDavPayloadsToStores({ store: config, statistics, recapStore: recap }, {
        config: { remote: true }, statistics: { count: 2 }, recap: { old: false }
    }), /disk failure/);
    assert.deepEqual(config.store, { local: true, 'webdav-sync': { url: 'https://dav' } });
    assert.deepEqual(recap.store, { old: true });
});

test('settings credential IPC rejects every non-settings renderer', async function () {
    const handlers = new Map();
    const service = createWebDavSyncService({
        app: { getPath: () => '/tmp' }, fs: require('fs'), path: require('path'), fetch: async () => {},
        ipcMain: { handle: (name, fn) => handlers.set(name, fn) }, i18n: { __: value => value }, keytar: null,
        getStore: () => memoryStore(), getStatisticsStore: () => memoryStore(), getRecapStore: () => memoryStore(),
        isSettingsWebContents: () => false
    });
    service.registerIpcHandlers();
    for (const name of ['webdav-config:getUiState', 'webdav-config:setEnabled', 'webdav-config:setNonSensitive', 'webdav-config:setPassword', 'webdav-config:clearPassword']) {
        await assert.rejects(() => handlers.get(name)({ sender: {} }, {}), /denied/);
    }
});

test('manifest and response limits are release-bounded', function () {
    assert.equal(_test.WEBDAV_MANIFEST_FILE, 'manifest.json');
    assert.equal(_test.WEBDAV_MAX_RESPONSE_BYTES, 16 * 1024 * 1024);
});
