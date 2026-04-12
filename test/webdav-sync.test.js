const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../webdav-sync');

class FakeStore {
    constructor(initial) {
        this.store = JSON.parse(JSON.stringify(initial || {}));
    }

    get(key, fallbackValue) {
        return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : fallbackValue;
    }

    set(keyOrObject, value) {
        if (typeof keyOrObject === 'string') {
            this.store[keyOrObject] = value;
            return;
        }
        this.store = JSON.parse(JSON.stringify(keyOrObject || {}));
    }

    clear() {
        this.store = {};
    }
}

test('buildSyncConfigPayloadFromStore excludes only local-only WebDAV keys', function () {
    const store = new FakeStore({
        alpha: 1,
        version: '1.0.0',
        'webdav-sync': { url: 'https://dav.example' },
        'previous-language': 'en',
        'just-back': true,
        keepMe: 'yes'
    });

    const payload = _test.buildSyncConfigPayloadFromStore(store);

    assert.deepEqual(payload, {
        alpha: 1,
        keepMe: 'yes'
    });
});

test('applyRemoteWebDavPayloadsToStores preserves local WebDAV credentials', function () {
    const stores = {
        store: new FakeStore({
            localSetting: true,
            'webdav-sync': { url: 'https://local', username: 'u', password: 'p', remotePath: 'r' }
        }),
        statistics: new FakeStore({ old: 1 }),
        recapStore: new FakeStore({ old: 2 })
    };

    _test.applyRemoteWebDavPayloadsToStores(stores, {
        config: { remoteSetting: true, 'webdav-sync': { url: 'https://remote' } },
        statistics: { synced: 3 },
        recap: { synced: 4 }
    });

    assert.deepEqual(stores.store.store, {
        remoteSetting: true,
        'webdav-sync': { url: 'https://local', username: 'u', password: 'p', remotePath: 'r' }
    });
    assert.deepEqual(stores.statistics.store, { synced: 3 });
    assert.deepEqual(stores.recapStore.store, { synced: 4 });
});

test('applyRemoteWebDavPayloadsToStores rolls back all stores on write failure', function () {
    class FlakyStore extends FakeStore {
        constructor(initial) {
            super(initial);
            this.failed = false;
        }

        set(keyOrObject, value) {
            if (typeof keyOrObject !== 'string' && this.failed === false) {
                this.failed = true;
                throw new Error('write failed');
            }
            super.set(keyOrObject, value);
        }
    }

    const stores = {
        store: new FakeStore({
            before: 'config',
            'webdav-sync': { url: 'https://local', username: 'u', password: 'p', remotePath: 'r' }
        }),
        statistics: new FlakyStore({ before: 'statistics' }),
        recapStore: new FakeStore({ before: 'recap' })
    };

    assert.throws(function () {
        _test.applyRemoteWebDavPayloadsToStores(stores, {
            config: { after: 'config' },
            statistics: { after: 'statistics' },
            recap: { after: 'recap' }
        });
    }, /write failed/);

    assert.deepEqual(stores.store.store, {
        before: 'config',
        'webdav-sync': { url: 'https://local', username: 'u', password: 'p', remotePath: 'r' }
    });
    assert.deepEqual(stores.statistics.store, { before: 'statistics' });
    assert.deepEqual(stores.recapStore.store, { before: 'recap' });
});

test('getLatestWebDavFailureDetailFromStatus keeps only unresolved latest failures', function () {
    const detail = _test.getLatestWebDavFailureDetailFromStatus({
        startupPull: {
            status: 'failed',
            source: 'startupPull',
            detail: 'startup failed',
            order: 1
        },
        lastPull: {
            status: 'success',
            source: 'manualPull',
            detail: '',
            order: 2
        },
        lastPush: {
            status: 'failed',
            source: 'manualPush',
            detail: 'push failed',
            order: 3
        }
    });

    assert.equal(detail, 'push failed');
});

test('toWebDavErrorPayload preserves ok false, message, and detail', function () {
    const error = _test.createWebDavError('visible message', 'detail message');
    assert.deepEqual(_test.toWebDavErrorPayload(error, 'fallback'), {
        ok: false,
        message: 'visible message',
        detail: 'detail message'
    });
    assert.deepEqual(_test.toWebDavErrorPayload(null, 'fallback'), {
        ok: false,
        message: 'fallback',
        detail: ''
    });
});
