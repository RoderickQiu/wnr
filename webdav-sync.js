const WEBDAV_SYNC_FILES = [
    { key: 'config', fileName: 'config.json' },
    { key: 'statistics', fileName: 'statistics.json' },
    { key: 'recap', fileName: 'recap.json' }
];
const WEBDAV_SYNC_CONFIG_KEY = 'webdav-sync';
const WEBDAV_AUTO_SYNC_READY_KEY = 'webdav-sync.autoSyncReady';
const WEBDAV_UNSYNCED_EXIT_MARKER_KEY = 'webdav-sync-unsynced-exit';
const WEBDAV_CREDENTIAL_SERVICE = 'wnr.webdav-sync';
const WEBDAV_EXCLUDED_CONFIG_KEYS = ['webdav-sync', 'version', 'previous-language', 'just-back', 'just-launched', 'just-relaunched', 'settings-goto', WEBDAV_UNSYNCED_EXIT_MARKER_KEY];
const WEBDAV_REQUEST_TIMEOUT_MS = 8000;
const WEBDAV_SYNC_LOG_FILE = 'webdav-sync.log';
const WEBDAV_SYNC_INTENT_PRIORITY = {
    manualPull: 1,
    manualPush: 2,
    beforeQuitFlush: 3,
    startupPull: 4,
    autoPush: 5
};

function cloneStoreData(data) {
    return JSON.parse(JSON.stringify(data || {}));
}

function createWebDavError(userMessage, detail) {
    const error = new Error(userMessage);
    error.userMessage = userMessage;
    error.detail = detail || '';
    return error;
}

function toWebDavErrorPayload(error, fallbackMessage) {
    const message = (error && (error.userMessage || error.message)) || fallbackMessage;
    const detail = (error && error.detail) || '';
    return {
        ok: false,
        message: message,
        detail: detail
    };
}

function delay(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function getWebDavFailureDetailOperationClass(source) {
    switch (source) {
        case 'startupPull':
            return 'startupPull';
        case 'manualPull':
            return 'pull';
        case 'autoPush':
        case 'manualPush':
        case 'beforeQuitFlush':
            return 'push';
        case 'testConnection':
        default:
            return null;
    }
}

function getWebDavFailureResolutionClasses(failureClass) {
    switch (failureClass) {
        case 'startupPull':
            return ['pull'];
        case 'pull':
            return ['pull'];
        case 'push':
            return ['push'];
        default:
            return [];
    }
}

function getLatestWebDavFailureDetailFromStatus(syncStatus) {
    let entries = Object.values(syncStatus || {}).filter(Boolean);
    if (entries.length === 0) return '';
    let latestFailuresByClass = new Map();
    let latestSuccessOrdersByClass = new Map();

    entries.forEach(function (entry) {
        let operationClass = getWebDavFailureDetailOperationClass(entry.source);
        if (entry.status === 'failed') {
            if (operationClass == null) return;
            let currentLatestFailure = latestFailuresByClass.get(operationClass);
            if (currentLatestFailure == null || (entry.order || 0) > (currentLatestFailure.order || 0)) {
                latestFailuresByClass.set(operationClass, entry);
            }
        }
        if (entry.status === 'success') {
            if (operationClass == null) return;
            let currentLatestSuccessOrder = latestSuccessOrdersByClass.get(operationClass) || 0;
            latestSuccessOrdersByClass.set(operationClass, Math.max(currentLatestSuccessOrder, entry.order || 0));
        }
    });

    let remainingFailures = [];
    latestFailuresByClass.forEach(function (entry, failureClass) {
        let resolutionClasses = getWebDavFailureResolutionClasses(failureClass);
        let latestResolutionOrder = 0;
        resolutionClasses.forEach(function (resolutionClass) {
            latestResolutionOrder = Math.max(latestResolutionOrder, latestSuccessOrdersByClass.get(resolutionClass) || 0);
        });
        if ((entry.order || 0) > latestResolutionOrder) remainingFailures.push(entry);
    });

    if (remainingFailures.length === 0) return '';
    remainingFailures.sort(function (a, b) {
        return (b.order || 0) - (a.order || 0);
    });
    return remainingFailures[0].detail || '';
}

function buildSyncConfigPayloadFromStore(store) {
    let configSnapshot = cloneStoreData(store.store);
    for (let i = 0; i < WEBDAV_EXCLUDED_CONFIG_KEYS.length; i++) {
        delete configSnapshot[WEBDAV_EXCLUDED_CONFIG_KEYS[i]];
    }
    return configSnapshot;
}

function applyFullStoreData(targetStore, snapshot) {
    targetStore.clear();
    targetStore.set(snapshot);
}

function applyRemoteWebDavPayloadsToStores(stores, fetchedPayloads) {
    let store = stores.store;
    let statistics = stores.statistics;
    let recapStore = stores.recapStore;
    let currentConfig = cloneStoreData(store.store);
    let currentStatistics = cloneStoreData(statistics.store);
    let currentRecap = cloneStoreData(recapStore.store);
    let localWebDavConfig = cloneStoreData(store.get(WEBDAV_SYNC_CONFIG_KEY, {}));

    try {
        let configPayload = cloneStoreData(fetchedPayloads.config);
        configPayload[WEBDAV_SYNC_CONFIG_KEY] = localWebDavConfig;

        applyFullStoreData(store, configPayload);
        applyFullStoreData(statistics, fetchedPayloads.statistics);
        applyFullStoreData(recapStore, fetchedPayloads.recap);
    } catch (e) {
        applyFullStoreData(store, currentConfig);
        applyFullStoreData(statistics, currentStatistics);
        applyFullStoreData(recapStore, currentRecap);
        throw e;
    }
}

function createWebDavSyncService(deps) {
    const {
        app,
        fs,
        path,
        fetch,
        ipcMain,
        i18n,
        keytar,
        notifyWarning,
        getStore,
        getStatisticsStore,
        getRecapStore,
        showExitDialog,
        hideExitDialog
    } = deps;

    let webDavWatchersStarted = false;
    let webDavAutoPushTimer = null;
    let lastSyncedCoreSignature = null;
    let webDavSyncStatus = {
        startupPull: null,
        lastPull: null,
        lastPush: null,
        lastTest: null
    };
    let webDavSyncStatusOrder = 0;
    let webDavSyncSuppressionTokens = new Map();
    let webDavCoordinator = null;
    let webDavStartupMutationSuppressionToken = null;
    let exitAuthority = null;
    let ipcHandlersRegistered = false;
    let cachedWebDavPassword = '';
    let cachedWebDavCredentialError = '';

    function getStores() {
        return {
            store: getStore(),
            statistics: getStatisticsStore(),
            recapStore: getRecapStore()
        };
    }

    function getStoreOrNull() {
        return getStores().store;
    }

    function getStoredWebDavConfigSnapshot() {
        let store = getStoreOrNull();
        let config = cloneStoreData(store != null ? store.get(WEBDAV_SYNC_CONFIG_KEY, {}) : {});
        return {
            url: String(config.url || '').trim(),
            username: String(config.username || ''),
            remotePath: String(config.remotePath || '').trim()
        };
    }

    function normalizeWebDavRemotePath(remotePath) {
        let normalized = String(remotePath || '').trim().replace(/\\/g, '/');
        normalized = normalized.replace(/\/+/g, '/');
        normalized = normalized.replace(/^\/+|\/+$/g, '');
        return normalized;
    }

    function buildWebDavCredentialAccount(config) {
        let username = String(config.username || '').trim();
        let remotePath = normalizeWebDavRemotePath(config.remotePath);

        try {
            let parsed = new URL(String(config.url || '').trim());
            let hostname = parsed.hostname.toLowerCase();
            let port = parsed.port;
            let protocol = parsed.protocol.toLowerCase();
            if (port === '443' && protocol === 'https:') port = '';
            let hostWithPort = port ? `${ hostname }:${ port }` : hostname;
            return `${ username }@${ hostWithPort }:${ remotePath }`;
        } catch (e) {
            return `${ username }@${ String(config.url || '').trim() }:${ remotePath }`;
        }
    }

    async function getCredentialPassword(config) {
        if (keytar == null) return '';
        return await keytar.getPassword(WEBDAV_CREDENTIAL_SERVICE, buildWebDavCredentialAccount(config)) || '';
    }

    async function setCredentialPassword(config, password) {
        if (keytar == null) throw new Error('keytar unavailable');
        await keytar.setPassword(WEBDAV_CREDENTIAL_SERVICE, buildWebDavCredentialAccount(config), String(password || ''));
    }

    async function deleteCredentialPassword(config) {
        if (keytar == null) return false;
        return await keytar.deletePassword(WEBDAV_CREDENTIAL_SERVICE, buildWebDavCredentialAccount(config));
    }

    async function refreshCachedWebDavPassword(configOverride) {
        let config = configOverride || getStoredWebDavConfigSnapshot();
        try {
            cachedWebDavPassword = await getCredentialPassword(config);
            cachedWebDavCredentialError = '';
        } catch (e) {
            cachedWebDavPassword = '';
            cachedWebDavCredentialError = e && e.message ? e.message : String(e);
        }
        return cachedWebDavPassword;
    }

    async function migrateLegacyWebDavPasswordIfNeeded(configOverride) {
        let store = getStoreOrNull();
        if (store == null || !store.has('webdav-sync.password')) return false;

        let legacyPassword = String(store.get('webdav-sync.password') || '');
        if (legacyPassword === '') {
            store.delete('webdav-sync.password');
            return false;
        }

        let config = configOverride || getStoredWebDavConfigSnapshot();
        await setCredentialPassword(config, legacyPassword);
        store.delete('webdav-sync.password');
        cachedWebDavPassword = legacyPassword;
        cachedWebDavCredentialError = '';
        return true;
    }

    async function persistNonSensitiveWebDavConfig(nextConfig) {
        let store = getStoreOrNull();
        if (store == null) return getStoredWebDavConfigSnapshot();

        let currentConfig = cloneStoreData(store.get(WEBDAV_SYNC_CONFIG_KEY, {}));
        let mergedConfig = Object.assign({}, currentConfig, {
            url: String(nextConfig.url || '').trim(),
            username: String(nextConfig.username || ''),
            remotePath: String(nextConfig.remotePath || '').trim()
        });
        delete mergedConfig.password;
        store.set(WEBDAV_SYNC_CONFIG_KEY, mergedConfig);
        store.delete('webdav-sync.password');
        setWebDavAutoSyncReady(false, 'settings-updated');
        await refreshCachedWebDavPassword(mergedConfig);
        return getStoredWebDavConfigSnapshot();
    }

    async function setWebDavPassword(password) {
        let normalizedPassword = String(password || '');
        let config = getStoredWebDavConfigSnapshot();
        await setCredentialPassword(config, normalizedPassword);
        let store = getStoreOrNull();
        if (store != null && store.has('webdav-sync.password')) store.delete('webdav-sync.password');
        cachedWebDavPassword = normalizedPassword;
        cachedWebDavCredentialError = '';
        setWebDavAutoSyncReady(false, 'password-updated');
        return {
            hasPassword: normalizedPassword !== ''
        };
    }

    async function clearWebDavPassword() {
        let config = getStoredWebDavConfigSnapshot();
        await deleteCredentialPassword(config);
        let store = getStoreOrNull();
        if (store != null && store.has('webdav-sync.password')) store.delete('webdav-sync.password');
        cachedWebDavPassword = '';
        cachedWebDavCredentialError = '';
        setWebDavAutoSyncReady(false, 'password-cleared');
        return {
            hasPassword: false
        };
    }

    async function getWebDavConfigUiState() {
        let config = getStoredWebDavConfigSnapshot();
        await refreshCachedWebDavPassword(config);
        return Object.assign({}, config, {
            hasPassword: cachedWebDavPassword !== ''
        });
    }

    function appendWebDavSyncLog(event, detail) {
        try {
            const logPath = path.join(app.getPath('userData'), WEBDAV_SYNC_LOG_FILE);
            const line = `[${ new Date().toISOString() }] ${ event }${ detail ? ' | ' + detail : '' }\n`;
            fs.appendFileSync(logPath, line, 'utf8');
        } catch (e) {
            console.log(e);
        }
    }

    function setWebDavSyncStatus(key, status, message, detail, source) {
        webDavSyncStatus[key] = {
            status: status,
            message: message,
            detail: detail || '',
            source: source || key,
            updatedAt: new Date().toISOString(),
            order: ++webDavSyncStatusOrder
        };
    }

    function getWebDavSyncStatus() {
        return Object.assign(cloneStoreData(webDavSyncStatus), {
            latestFailureDetail: getLatestWebDavFailureDetailFromStatus(webDavSyncStatus),
            autoReady: isWebDavAutoSyncReady(),
            suppressed: isWebDavAutoSyncSuppressed(),
            coordinatorBusy: webDavCoordinator != null && webDavCoordinator.currentOperation != null,
            remoteWriteFrozen: webDavCoordinator != null && webDavCoordinator.remoteWriteFrozen === true,
            remoteWriteFreezeReason: webDavCoordinator != null ? webDavCoordinator.remoteWriteFreezeReason : null
        });
    }

    function getWebDavSyncConfig() {
        let config = getStoredWebDavConfigSnapshot();
        return {
            url: config.url,
            username: config.username,
            password: cachedWebDavPassword,
            remotePath: config.remotePath
        };
    }

    function isWebDavConfigured() {
        let config = getWebDavSyncConfig();
        return config.url !== '' && config.username !== '' && config.password !== '' && config.remotePath !== '';
    }

    function isWebDavAutoSyncReady() {
        let store = getStoreOrNull();
        return store != null && store.get(WEBDAV_AUTO_SYNC_READY_KEY) === true;
    }

    function setWebDavAutoSyncReady(ready, reason) {
        let store = getStoreOrNull();
        if (store == null) return;
        let normalizedReady = ready === true;
        if (store.get(WEBDAV_AUTO_SYNC_READY_KEY) === normalizedReady) return;
        store.set(WEBDAV_AUTO_SYNC_READY_KEY, normalizedReady);
        appendWebDavSyncLog('auto-sync-ready', `${ normalizedReady ? 'enabled' : 'disabled' }${ reason ? ' | ' + reason : '' }`);
    }

    function getSyncPayloadMap() {
        let stores = getStores();
        return {
            config: buildSyncConfigPayloadFromStore(stores.store),
            statistics: cloneStoreData(stores.statistics.store),
            recap: cloneStoreData(stores.recapStore.store)
        };
    }

    function computeCoreSyncSignature() {
        return JSON.stringify(getSyncPayloadMap());
    }

    function createWebDavSyncSuppressionToken(scope, reason, operationId) {
        let tokenId = `${ scope || 'unknown' }-${ Date.now() }-${ Math.random().toString(16).slice(2) }`;
        webDavSyncSuppressionTokens.set(tokenId, {
            scope: scope || 'unknown',
            reason: reason || '',
            operationId: operationId || null,
            startedAt: new Date().toISOString()
        });
        appendWebDavSyncLog('sync-suppression-start', `${ tokenId } [${ scope || 'unknown' }]${ reason ? ' ' + reason : '' }`);
        return tokenId;
    }

    function isWebDavAutoSyncSuppressed() {
        return webDavSyncSuppressionTokens.size > 0;
    }

    function releaseWebDavSyncSuppressionToken(tokenId) {
        if (!webDavSyncSuppressionTokens.has(tokenId)) return;
        let token = webDavSyncSuppressionTokens.get(tokenId);
        webDavSyncSuppressionTokens.delete(tokenId);
        appendWebDavSyncLog('sync-suppression-end', `${ tokenId } [${ token.scope }]`);
    }

    async function runWithWebDavSyncSuppressed(fn, scope, reason, operationId) {
        let tokenId = createWebDavSyncSuppressionToken(scope, reason, operationId);
        try {
            return await fn();
        } finally {
            releaseWebDavSyncSuppressionToken(tokenId);
        }
    }

    function getWebDavSyncTestOptions() {
        return {
            enabled: process.env.WEBDAV_SYNC_TEST_MODE === '1',
            uploadDelayMs: Math.max(0, Number(process.env.WEBDAV_SYNC_TEST_UPLOAD_DELAY_MS || 0)),
            watcherDelayMs: Math.max(0, Number(process.env.WEBDAV_SYNC_TEST_WATCHER_DELAY_MS || 0)),
            quitDrainTimeoutMs: Math.max(1000, Number(process.env.WEBDAV_SYNC_TEST_QUIT_DRAIN_TIMEOUT_MS || 5000)),
            failUpload: process.env.WEBDAV_SYNC_TEST_FAIL_UPLOAD === '1',
            failDownload: process.env.WEBDAV_SYNC_TEST_FAIL_DOWNLOAD === '1'
        };
    }

    async function runWebDavSyncTestHook(name, context) {
        let options = getWebDavSyncTestOptions();
        if (!options.enabled) return;

        if (name === 'before-upload-complete') {
            if (options.uploadDelayMs > 0) {
                appendWebDavSyncLog('test-hook-upload-delay', `${ options.uploadDelayMs }ms`);
                await delay(options.uploadDelayMs);
            }
            if (options.failUpload) {
                throw createWebDavError(i18n.__('webdav-sync-upload-failed'), 'forced upload failure in test mode');
            }
        }

        if (name === 'before-download-apply' && options.failDownload) {
            throw createWebDavError(i18n.__('webdav-sync-download-failed'), 'forced download failure in test mode');
        }

        if (name === 'watcher-delay' && options.watcherDelayMs > 0) {
            appendWebDavSyncLog('test-hook-watcher-delay', `${ options.watcherDelayMs }ms${ context ? ' [' + context + ']' : '' }`);
            await delay(options.watcherDelayMs);
        }
    }

    function ensureWebDavSyncCoordinator() {
        if (webDavCoordinator != null) return webDavCoordinator;

        webDavCoordinator = {
            queue: [],
            isRunning: false,
            currentOperation: null,
            pendingAutoPushOperation: null,
            nextOperationId: 1,
            nextUploadTaskId: 1,
            stateVersion: 0,
            lastObservedSignature: null,
            remoteWriteFrozen: false,
            remoteWriteFreezeReason: null,
            remoteWriteFrozenByOperationId: null,
            remoteWriteFrozenAt: null
        };

        return webDavCoordinator;
    }

    function isWebDavRemoteWriteIntent(type) {
        return type === 'autoPush' || type === 'manualPush' || type === 'beforeQuitFlush';
    }

    function freezeWebDavRemoteWriteLane(reason, operationId) {
        let coordinator = ensureWebDavSyncCoordinator();
        coordinator.remoteWriteFrozen = true;
        coordinator.remoteWriteFreezeReason = reason || 'unknown';
        coordinator.remoteWriteFrozenByOperationId = operationId || null;
        coordinator.remoteWriteFrozenAt = new Date().toISOString();
        appendWebDavSyncLog('freeze-enter', `${ coordinator.remoteWriteFreezeReason }${ operationId ? ' | op=' + operationId : '' }`);
    }

    function unfreezeWebDavRemoteWriteLane(reason, operationId) {
        let coordinator = ensureWebDavSyncCoordinator();
        if (!coordinator.remoteWriteFrozen) return;
        appendWebDavSyncLog('freeze-exit', `${ reason || 'manual-push' }${ operationId ? ' | op=' + operationId : '' }`);
        coordinator.remoteWriteFrozen = false;
        coordinator.remoteWriteFreezeReason = null;
        coordinator.remoteWriteFrozenByOperationId = null;
        coordinator.remoteWriteFrozenAt = null;
    }

    function isWebDavWriteLaneFrozen() {
        let coordinator = ensureWebDavSyncCoordinator();
        return coordinator.remoteWriteFrozen === true;
    }

    function canOperationBypassWebDavWriteFreeze(operation) {
        if (!isWebDavRemoteWriteIntent(operation.type)) return true;
        return operation.type === 'manualPush' && operation.options.explicitUserAction === true;
    }

    function logWebDavWriteBlocked(operation, reason) {
        appendWebDavSyncLog('write-blocked', `${ operation.type }#${ operation.operationId } | ${ reason || 'remote-write-frozen' }`);
    }

    function synchronizeWebDavObservedState(reason) {
        let coordinator = ensureWebDavSyncCoordinator();
        coordinator.lastObservedSignature = computeCoreSyncSignature();
        coordinator.stateVersion += 1;
        appendWebDavSyncLog('sync-state-synchronized', `${ reason || 'unknown' } | v${ coordinator.stateVersion }`);
        return {
            signature: coordinator.lastObservedSignature,
            stateVersion: coordinator.stateVersion
        };
    }

    function observeWebDavLocalState(reason) {
        let coordinator = ensureWebDavSyncCoordinator();
        let signature = computeCoreSyncSignature();
        if (coordinator.lastObservedSignature !== signature) {
            coordinator.lastObservedSignature = signature;
            coordinator.stateVersion += 1;
            appendWebDavSyncLog('sync-state-observed', `${ reason || 'unknown' } | v${ coordinator.stateVersion }`);
        }
        return {
            signature: signature,
            stateVersion: coordinator.stateVersion
        };
    }

    function createWebDavCoordinatorOperation(type, options) {
        let coordinator = ensureWebDavSyncCoordinator();
        let operation = {
            type: type,
            priority: WEBDAV_SYNC_INTENT_PRIORITY[type] || 99,
            options: Object.assign({}, options),
            operationId: coordinator.nextOperationId++,
            enqueuedAt: Date.now()
        };

        operation.promise = new Promise(function (resolve, reject) {
            operation.resolve = resolve;
            operation.reject = reject;
        });

        return operation;
    }

    function sortWebDavCoordinatorQueue() {
        let coordinator = ensureWebDavSyncCoordinator();
        coordinator.queue.sort(function (a, b) {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.operationId - b.operationId;
        });
    }

    function clearQueuedAutoPushes(reason) {
        let coordinator = ensureWebDavSyncCoordinator();
        if (coordinator.pendingAutoPushOperation != null) {
            coordinator.pendingAutoPushOperation.resolve({
                ok: true,
                skipped: true,
                message: i18n.__('webdav-sync-auto-idle'),
                reason: reason || 'cleared'
            });
        }
        coordinator.queue = coordinator.queue.filter(function (operation) {
            return operation.type !== 'autoPush';
        });
        coordinator.pendingAutoPushOperation = null;
    }

    function cancelPendingWebDavOverwriteConfirm() {
        let coordinator = ensureWebDavSyncCoordinator();
        if (!coordinator.remoteWriteFrozen || coordinator.remoteWriteFreezeReason !== 'awaitingManualOverwriteConfirm') return;
        unfreezeWebDavRemoteWriteLane('manual-overwrite-confirm-cancelled', coordinator.remoteWriteFrozenByOperationId);
    }

    function resolvePendingWebDavOverwriteConfirm(reason) {
        let coordinator = ensureWebDavSyncCoordinator();
        if (!coordinator.remoteWriteFrozen || coordinator.remoteWriteFreezeReason !== 'awaitingManualOverwriteConfirm') return;
        unfreezeWebDavRemoteWriteLane(reason || 'manual-overwrite-confirm-resolved', coordinator.remoteWriteFrozenByOperationId);
    }

    function queueWebDavCoordinatorOperation(type, options) {
        let coordinator = ensureWebDavSyncCoordinator();
        let operation = createWebDavCoordinatorOperation(type, options);
        coordinator.queue.push(operation);
        sortWebDavCoordinatorQueue();
        processWebDavCoordinatorQueue();
        return operation.promise;
    }

    function requestWebDavIntent(type, options) {
        let coordinator = ensureWebDavSyncCoordinator();
        let intentOptions = Object.assign({}, options);

        if (type === 'manualPush' && intentOptions.explicitUserAction === true && coordinator.remoteWriteFrozen) {
            unfreezeWebDavRemoteWriteLane('explicit-manual-push', coordinator.currentOperation != null ? coordinator.currentOperation.operationId : null);
        }

        if (type === 'autoPush') {
            if (!isWebDavAutoSyncReady()) {
                appendWebDavSyncLog('auto-push-skip', `initial-sync-required [${ intentOptions.reason || 'unknown' }]`);
                return Promise.resolve({
                    ok: true,
                    skipped: true,
                    autoSyncNotReady: true,
                    message: i18n.__('webdav-sync-auto-awaiting-initial-sync')
                });
            }

            if (!intentOptions.ignoreSuppression && isWebDavAutoSyncSuppressed()) {
                appendWebDavSyncLog('auto-push-skip', `suppressed [${ intentOptions.reason || 'unknown' }]`);
                return Promise.resolve({
                    ok: true,
                    skipped: true,
                    message: i18n.__('webdav-sync-auto-idle')
                });
            }

            let observed = observeWebDavLocalState(`auto-push:${ intentOptions.reason || 'unknown' }`);
            if (observed.signature === lastSyncedCoreSignature) {
                appendWebDavSyncLog('auto-push-skip', `already-synced [${ intentOptions.reason || 'unknown' }]`);
                return Promise.resolve({
                    ok: true,
                    skipped: true,
                    message: i18n.__('webdav-sync-upload-ok')
                });
            }

            if (coordinator.pendingAutoPushOperation != null) {
                let pending = coordinator.pendingAutoPushOperation;
                let reasons = pending.options.reasons || [];
                if (intentOptions.reason && !reasons.includes(intentOptions.reason)) reasons.push(intentOptions.reason);
                pending.options.reasons = reasons;
                pending.options.ignoreSuppression = pending.options.ignoreSuppression || intentOptions.ignoreSuppression === true;
                return pending.promise;
            }

            intentOptions.reasons = intentOptions.reason ? [intentOptions.reason] : [];
            let operation = createWebDavCoordinatorOperation(type, intentOptions);
            coordinator.pendingAutoPushOperation = operation;
            coordinator.queue.push(operation);
            sortWebDavCoordinatorQueue();
            processWebDavCoordinatorQueue();
            return operation.promise;
        }

        if (type === 'beforeQuitFlush' && !isWebDavAutoSyncReady()) {
            appendWebDavSyncLog('quit-flush-blocked', `initial-sync-required [${ intentOptions.reason || 'unknown' }]`);
            return Promise.resolve({
                ok: false,
                autoSyncNotReady: true,
                blockedByInitialSync: true,
                message: i18n.__('webdav-sync-auto-awaiting-initial-sync'),
                detail: i18n.__('webdav-sync-auto-awaiting-initial-sync')
            });
        }

        if (type === 'beforeQuitFlush' && coordinator.remoteWriteFrozen) {
            appendWebDavSyncLog('quit-flush-skipped-due-to-freeze', coordinator.remoteWriteFreezeReason || 'awaiting-confirmation');
            return Promise.resolve({
                ok: true,
                skipped: true,
                blockedByFreeze: true,
                message: i18n.__('webdav-sync-auto-idle')
            });
        }

        if (type === 'manualPush' || type === 'beforeQuitFlush') {
            observeWebDavLocalState(`${ type }:${ intentOptions.reason || 'manual' }`);
        }

        return queueWebDavCoordinatorOperation(type, intentOptions);
    }

    function requestWebDavIntentInBackground(type, options) {
        requestWebDavIntent(type, options).catch(function (e) {
            console.log(e);
            appendWebDavSyncLog('sync-intent-background-failed', `${ type } | ${ e.detail || e.message || '' }`);
        });
    }

    function ensureExitAuthority() {
        if (exitAuthority != null) return exitAuthority;

        exitAuthority = {
            active: false,
            finalizing: false,
            sessionId: 0,
            dialogState: null,
            source: null,
            interactive: false,
            relaunch: false,
            mayMutateLocal: true,
            mutationApplied: false,
            beforeExitMutation: null,
            beforeFinalizeCallbacks: [],
            pendingDecisionResolver: null,
            promise: null
        };

        return exitAuthority;
    }

    function clearWebDavUnsyncedExitMarker() {
        try {
            let store = getStoreOrNull();
            if (store != null && store.has(WEBDAV_UNSYNCED_EXIT_MARKER_KEY)) {
                store.delete(WEBDAV_UNSYNCED_EXIT_MARKER_KEY);
            }
        } catch (e) {
            console.log(e);
        }
    }

    function setWebDavUnsyncedExitMarker(source, reason) {
        try {
            let store = getStoreOrNull();
            if (store == null) return;
            store.set(WEBDAV_UNSYNCED_EXIT_MARKER_KEY, {
                source: source || 'unknown',
                reason: reason || 'unknown',
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.log(e);
        }
    }

    function applyGuardedExitRequiredCleanup() {
        try {
            let store = getStoreOrNull();
            if (store != null) store.set('just-back', false);
        } catch (e) {
            console.log(e);
        }
    }

    function resetExitAuthority(authority) {
        authority.active = false;
        authority.finalizing = false;
        authority.source = null;
        authority.interactive = false;
        authority.relaunch = false;
        authority.dialogState = null;
        authority.mayMutateLocal = true;
        authority.mutationApplied = false;
        authority.beforeExitMutation = null;
        authority.beforeFinalizeCallbacks = [];
        authority.pendingDecisionResolver = null;
        authority.promise = null;
    }

    function getExitSyncDialogPayload(authority, state, detail) {
        let payload = {
            dialogKind: 'exit-sync',
            exitSessionId: authority.sessionId,
            state: state,
            title: i18n.__('webdav-sync-exit-timeout-title'),
            msg: i18n.__('webdav-sync-exit-timeout-message'),
            detail: detail || '',
            interactive: false,
            primaryLabel: '',
            secondaryLabel: ''
        };

        if (state === 'syncing') {
            payload.title = i18n.__('webdav-sync-exit-syncing-title');
            payload.msg = i18n.__('webdav-sync-exit-syncing-message');
        } else if (state === 'initial-sync-choice') {
            payload.title = i18n.__('webdav-sync-exit-initial-choice-title');
            payload.msg = i18n.__('webdav-sync-exit-initial-choice-message');
            payload.interactive = true;
            payload.primaryLabel = i18n.__('webdav-sync-exit-upload-local');
            payload.secondaryLabel = i18n.__('webdav-sync-exit-download-cloud');
        } else if (state === 'timeout') {
            payload.interactive = true;
            payload.primaryLabel = i18n.__('webdav-sync-exit-wait');
            payload.secondaryLabel = i18n.__('webdav-sync-exit-force-quit');
        } else if (state === 'failed') {
            payload.title = i18n.__('webdav-sync-exit-failed-title');
            payload.msg = i18n.__('webdav-sync-exit-failed-message');
            payload.interactive = true;
            payload.primaryLabel = i18n.__('webdav-sync-exit-retry');
            payload.secondaryLabel = i18n.__('webdav-sync-exit-force-quit');
        }

        return payload;
    }

    function requestExitSyncDialogDecision(authority, state, detail) {
        authority.dialogState = state;
        appendWebDavSyncLog('exit-ui-state', `${ state } | session=${ authority.sessionId }`);
        let shown = showExitDialog(getExitSyncDialogPayload(authority, state, detail));
        if (!shown) {
            appendWebDavSyncLog('exit-ui-fallback-unavailable', `${ state } | session=${ authority.sessionId }`);
            return Promise.resolve('force-quit');
        }
        return new Promise(function (resolve) {
            authority.pendingDecisionResolver = resolve;
        });
    }

    async function runExitSyncAttempt(source) {
        appendWebDavSyncLog('exit-sync-attempt', source || 'unknown');
        if (!isWebDavConfigured()) {
            clearWebDavUnsyncedExitMarker();
            appendWebDavSyncLog('exit-sync-success', `${ source || 'unknown' } | webdav-not-configured`);
            return { ok: true, skipped: true };
        }

        if (webDavAutoPushTimer) {
            clearTimeout(webDavAutoPushTimer);
            webDavAutoPushTimer = null;
            appendWebDavSyncLog('before-quit-flush-cancel-pending-timer');
        }

        if (computeCoreSyncSignature() === lastSyncedCoreSignature) {
            clearWebDavUnsyncedExitMarker();
            appendWebDavSyncLog('exit-sync-success', `${ source || 'unknown' } | already-synced`);
            return { ok: true, skipped: true };
        }

        let timeoutMs = getWebDavSyncTestOptions().quitDrainTimeoutMs;
        try {
            let result = await Promise.race([
                requestWebDavIntent('beforeQuitFlush', {
                    reason: source || 'exit-guard',
                    ignoreSuppression: true
                }),
                delay(timeoutMs).then(function () {
                    return { ok: false, timeout: true, reason: 'timeout' };
                })
            ]);

            if (result && result.blockedByFreeze) {
                appendWebDavSyncLog('exit-sync-timeout', `${ source || 'unknown' } | blocked-by-freeze`);
                return { ok: false, blockedByFreeze: true, reason: 'blocked-by-freeze' };
            }
            if (result && result.blockedByInitialSync) {
                appendWebDavSyncLog('exit-sync-initial-sync-choice-required', `${ source || 'unknown' }`);
                return {
                    ok: false,
                    requiresInitialSyncChoice: true,
                    reason: 'initial-sync-choice',
                    detail: result.detail || result.message || ''
                };
            }
            if (result && result.timeout) {
                appendWebDavSyncLog('exit-sync-timeout', `${ source || 'unknown' } | timeout`);
                return result;
            }
            if (result && result.ok === false) {
                appendWebDavSyncLog('exit-sync-failed', `${ source || 'unknown' } | ${ result.detail || result.message || 'failed' }`);
                return { ok: false, failed: true, reason: 'failed', detail: result.detail || result.message || '' };
            }

            clearWebDavUnsyncedExitMarker();
            appendWebDavSyncLog('exit-sync-success', source || 'unknown');
            return { ok: true };
        } catch (e) {
            appendWebDavSyncLog('exit-sync-failed', `${ source || 'unknown' } | ${ e.detail || e.message || 'error' }`);
            return { ok: false, failed: true, reason: 'failed', detail: e.detail || e.message || '' };
        }
    }

    async function finalizeExitAuthority(authority, reason) {
        if (authority.finalizing) return { finalized: true };
        authority.finalizing = true;
        appendWebDavSyncLog('exit-authority-finalize', `${ authority.source || 'unknown' }${ reason ? ' | ' + reason : '' }`);
        hideExitDialog();
        applyGuardedExitRequiredCleanup();
        authority.beforeFinalizeCallbacks.forEach(function (fn) {
            try {
                fn();
            } catch (e) {
                console.log(e);
            }
        });
        if (authority.relaunch) app.relaunch();
        app.exit(0);
        return { finalized: true };
    }

    async function runExitAuthorityFlow(authority) {
        appendWebDavSyncLog('exit-guard-begin', authority.source || 'unknown');
        if (authority.beforeExitMutation != null && !authority.mutationApplied) {
            await authority.beforeExitMutation();
            authority.mutationApplied = true;
        }

        if (authority.mayMutateLocal !== true) {
            clearWebDavUnsyncedExitMarker();
            return await finalizeExitAuthority(authority, 'no-local-mutation');
        }

        while (true) {
            showExitDialog(getExitSyncDialogPayload(authority, 'syncing', ''));
            let syncResult = await runExitSyncAttempt(authority.source);
            if (syncResult.ok) return await finalizeExitAuthority(authority, 'synced');

            if (!authority.interactive) {
                setWebDavUnsyncedExitMarker(authority.source, syncResult.reason || 'noninteractive-force-quit');
                appendWebDavSyncLog('exit-noninteractive-force-quit-unsynced', `${ authority.source || 'unknown' } | ${ syncResult.reason || 'unknown' }`);
                return await finalizeExitAuthority(authority, 'noninteractive-force-quit');
            }

            let nextState = syncResult.requiresInitialSyncChoice ? 'initial-sync-choice' : (syncResult.failed ? 'failed' : 'timeout');
            let decision = await requestExitSyncDialogDecision(authority, nextState, syncResult.detail || '');
            authority.pendingDecisionResolver = null;

            if (decision === 'upload-local') {
                appendWebDavSyncLog('exit-user-select-upload-local', authority.source || 'unknown');
                try {
                    await requestWebDavIntent('manualPush', {
                        confirmOverwrite: true,
                        reason: 'exit-initial-sync-upload',
                        explicitUserAction: true
                    });
                } catch (e) {
                    console.log(e);
                }
                continue;
            }
            if (decision === 'download-cloud') {
                appendWebDavSyncLog('exit-user-select-download-cloud', authority.source || 'unknown');
                try {
                    await requestWebDavIntent('manualPull', {
                        reason: 'exit-initial-sync-download'
                    });
                } catch (e) {
                    console.log(e);
                }
                continue;
            }
            if (decision === 'wait') {
                appendWebDavSyncLog('exit-user-continue-wait', authority.source || 'unknown');
                continue;
            }
            if (decision === 'retry') {
                appendWebDavSyncLog('exit-user-retry-sync', authority.source || 'unknown');
                continue;
            }

            setWebDavUnsyncedExitMarker(authority.source, syncResult.reason || 'user-force-quit');
            appendWebDavSyncLog('exit-user-force-quit', `${ authority.source || 'unknown' } | ${ syncResult.reason || 'unknown' }`);
            return await finalizeExitAuthority(authority, 'user-force-quit');
        }
    }

    function requestAppExitWithGuard(context) {
        let authority = ensureExitAuthority();
        let options = Object.assign({
            source: 'unknown-exit',
            interactive: false,
            mayMutateLocal: true,
            relaunch: false,
            beforeExitMutation: null,
            beforeFinalize: null
        }, context || {});

        if (authority.active && !authority.finalizing) {
            authority.interactive = authority.interactive || options.interactive === true;
            authority.mayMutateLocal = authority.mayMutateLocal || options.mayMutateLocal !== false;
            authority.relaunch = authority.relaunch || options.relaunch === true;
            if (authority.beforeExitMutation == null && options.beforeExitMutation != null && !authority.mutationApplied) {
                authority.beforeExitMutation = options.beforeExitMutation;
            }
            if (options.beforeFinalize != null) authority.beforeFinalizeCallbacks.push(options.beforeFinalize);
            return authority.promise;
        }

        authority.active = true;
        authority.finalizing = false;
        authority.sessionId += 1;
        authority.source = options.source;
        authority.interactive = options.interactive === true;
        authority.relaunch = options.relaunch === true;
        authority.mayMutateLocal = options.mayMutateLocal !== false;
        authority.beforeExitMutation = options.beforeExitMutation;
        authority.beforeFinalizeCallbacks = options.beforeFinalize != null ? [options.beforeFinalize] : [];
        authority.mutationApplied = false;
        authority.pendingDecisionResolver = null;
        authority.promise = runExitAuthorityFlow(authority).finally(function () {
            resetExitAuthority(authority);
        });
        return authority.promise;
    }

    async function processWebDavCoordinatorQueue() {
        let coordinator = ensureWebDavSyncCoordinator();
        if (coordinator.isRunning) return;

        coordinator.isRunning = true;
        try {
            while (coordinator.queue.length > 0) {
                sortWebDavCoordinatorQueue();
                let operationIndex = coordinator.queue.findIndex(function (item) {
                    return !isWebDavWriteLaneFrozen() || canOperationBypassWebDavWriteFreeze(item);
                });
                if (operationIndex === -1) {
                    coordinator.queue.forEach(function (item) {
                        if (isWebDavRemoteWriteIntent(item.type)) logWebDavWriteBlocked(item, coordinator.remoteWriteFreezeReason || 'awaiting-confirmation');
                    });
                    break;
                }

                let operation = coordinator.queue.splice(operationIndex, 1)[0];
                if (operation === coordinator.pendingAutoPushOperation) coordinator.pendingAutoPushOperation = null;
                coordinator.currentOperation = operation;
                appendWebDavSyncLog('sync-operation-begin', `${ operation.type }#${ operation.operationId }`);

                try {
                    let result = await executeWebDavCoordinatorOperation(operation);
                    operation.resolve(result);
                } catch (e) {
                    operation.reject(e);
                } finally {
                    appendWebDavSyncLog('sync-operation-end', `${ operation.type }#${ operation.operationId }`);
                    coordinator.currentOperation = null;
                }
            }
        } finally {
            coordinator.isRunning = false;
        }
    }

    async function executeWebDavCoordinatorOperation(operation) {
        switch (operation.type) {
            case 'startupPull':
                return await executeStartupPullOperation(operation);
            case 'manualPull':
                return await executePullOperation(operation, 'lastPull', 'manualPull');
            case 'manualPush':
            case 'autoPush':
            case 'beforeQuitFlush':
                return await executePushOperation(operation);
            default:
                return {
                    ok: true,
                    skipped: true
                };
        }
    }

    function buildWebDavAuthHeaders(config) {
        return {
            Authorization: 'Basic ' + Buffer.from(config.username + ':' + config.password, 'utf8').toString('base64')
        };
    }

    function encodePathSegments(pathValue) {
        return String(pathValue || '')
            .split('/')
            .filter(function (segment) {
                return segment !== '';
            })
            .map(function (segment) {
                return encodeURIComponent(segment);
            })
            .join('/');
    }

    function buildWebDavBaseUrl(config) {
        let baseUrl = String(config.url || '').trim().replace(/\/+$/, '');
        let remotePath = encodePathSegments(config.remotePath || '');
        if (remotePath !== '') return baseUrl + '/' + remotePath;
        return baseUrl;
    }

    function buildWebDavFileUrl(config, fileName) {
        return buildWebDavBaseUrl(config) + '/' + encodeURIComponent(fileName);
    }

    function validateWebDavSyncConfig() {
        let config = getWebDavSyncConfig();
        if (config.url === '' || config.username === '' || config.password === '' || config.remotePath === '') {
            throw createWebDavError(i18n.__('webdav-sync-missing-config'));
        }
        let parsedUrl = null;
        try {
            parsedUrl = new URL(config.url);
        } catch (e) {
            throw createWebDavError(i18n.__('webdav-sync-invalid-url'));
        }
        if (parsedUrl.protocol.toLowerCase() !== 'https:') {
            throw createWebDavError(i18n.__('webdav-sync-https-required'));
        }
        return config;
    }

    async function readResponseTextSafe(response) {
        try {
            return await response.text();
        } catch (e) {
            return '';
        }
    }

    async function fetchWebDav(url, options) {
        const controller = new AbortController();
        const timeout = setTimeout(function () {
            controller.abort();
        }, WEBDAV_REQUEST_TIMEOUT_MS);

        try {
            return await fetch(url, Object.assign({}, options, {
                signal: controller.signal
            }));
        } catch (e) {
            if (e && e.name === 'AbortError') throw createWebDavError(i18n.__('webdav-sync-timeout'));
            throw createWebDavError(i18n.__('webdav-sync-connection-failed'), e && e.message ? e.message : String(e));
        } finally {
            clearTimeout(timeout);
        }
    }

    async function ensureWebDavDirectory(config, authHeaders) {
        let baseUrl = String(config.url || '').trim().replace(/\/+$/, '');
        let pathSegments = String(config.remotePath || '')
            .split('/')
            .filter(function (segment) {
                return segment !== '';
            });
        let currentUrl = baseUrl;

        for (let i = 0; i < pathSegments.length; i++) {
            currentUrl += '/' + encodeURIComponent(pathSegments[i]);
            let response = await fetchWebDav(currentUrl, {
                method: 'MKCOL',
                headers: authHeaders
            });

            if ([200, 201, 204, 301, 302, 405].includes(response.status)) continue;
            if (response.status === 401 || response.status === 403) throw createWebDavError(i18n.__('webdav-sync-auth-failed'));
            if (response.status === 409) throw createWebDavError(i18n.__('webdav-sync-path-error'));

            let responseText = await readResponseTextSafe(response);
            throw createWebDavError(i18n.__('webdav-sync-path-error'), responseText);
        }
    }

    async function testWebDavDirectory(config, authHeaders) {
        let targetUrl = buildWebDavBaseUrl(config);
        let propfindResponse = await fetchWebDav(targetUrl, {
            method: 'PROPFIND',
            headers: Object.assign({
                Depth: '0',
                'Content-Type': 'application/xml; charset=utf-8'
            }, authHeaders),
            body: '<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:displayname/></d:prop></d:propfind>'
        });

        if ([200, 204, 207].includes(propfindResponse.status)) return;
        if (propfindResponse.status === 401 || propfindResponse.status === 403) throw createWebDavError(i18n.__('webdav-sync-auth-failed'));
        if (propfindResponse.status === 404) throw createWebDavError(i18n.__('webdav-sync-path-missing'));

        let headResponse = await fetchWebDav(targetUrl, {
            method: 'HEAD',
            headers: authHeaders
        });
        if ([200, 204, 301, 302].includes(headResponse.status)) return;
        if (headResponse.status === 401 || headResponse.status === 403) throw createWebDavError(i18n.__('webdav-sync-auth-failed'));
        if (headResponse.status === 404) throw createWebDavError(i18n.__('webdav-sync-path-missing'));

        throw createWebDavError(i18n.__('webdav-sync-connection-failed'));
    }

    async function remoteFileExists(fileUrl, authHeaders) {
        let response = await fetchWebDav(fileUrl, {
            method: 'HEAD',
            headers: authHeaders
        });

        if (response.status === 405) {
            response = await fetchWebDav(fileUrl, {
                method: 'GET',
                headers: authHeaders
            });
        }

        if (response.status === 200) return true;
        if (response.status === 404) return false;
        if (response.status === 401 || response.status === 403) throw createWebDavError(i18n.__('webdav-sync-auth-failed'));

        let responseText = await readResponseTextSafe(response);
        throw createWebDavError(i18n.__('webdav-sync-connection-failed'), responseText);
    }

    function validateRemoteStorePayloads(payloads) {
        for (let i = 0; i < WEBDAV_SYNC_FILES.length; i++) {
            let key = WEBDAV_SYNC_FILES[i].key;
            let value = payloads[key];
            if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                throw createWebDavError(i18n.__('webdav-sync-invalid-remote'));
            }
        }
    }

    function notifyWebDavWarning(message) {
        if (!message) return;
        if (notifyWarning != null) notifyWarning(message);
    }

    async function testWebDavConnection() {
        let config = validateWebDavSyncConfig();
        let authHeaders = buildWebDavAuthHeaders(config);
        await testWebDavDirectory(config, authHeaders);
        return {
            ok: true,
            message: i18n.__('webdav-sync-connection-ok')
        };
    }

    async function hasExistingRemoteWebDavData() {
        let config = validateWebDavSyncConfig();
        let authHeaders = buildWebDavAuthHeaders(config);
        for (let i = 0; i < WEBDAV_SYNC_FILES.length; i++) {
            let fileInfo = WEBDAV_SYNC_FILES[i];
            let fileUrl = buildWebDavFileUrl(config, fileInfo.fileName);
            if (await remoteFileExists(fileUrl, authHeaders)) return true;
        }
        return false;
    }

    async function uploadWebDavSync(confirmOverwrite) {
        let config = validateWebDavSyncConfig();
        let authHeaders = buildWebDavAuthHeaders(config);
        let payloadMap = getSyncPayloadMap();
        let existingFiles = [];

        await ensureWebDavDirectory(config, authHeaders);

        for (let i = 0; i < WEBDAV_SYNC_FILES.length; i++) {
            let fileInfo = WEBDAV_SYNC_FILES[i];
            let fileUrl = buildWebDavFileUrl(config, fileInfo.fileName);
            if (await remoteFileExists(fileUrl, authHeaders)) existingFiles.push(fileInfo.fileName);
        }

        if (existingFiles.length > 0 && confirmOverwrite !== true) {
            return {
                ok: false,
                needsConfirm: true,
                existingFiles: existingFiles
            };
        }

        for (let i = 0; i < WEBDAV_SYNC_FILES.length; i++) {
            let fileInfo = WEBDAV_SYNC_FILES[i];
            let response = await fetchWebDav(buildWebDavFileUrl(config, fileInfo.fileName), {
                method: 'PUT',
                headers: Object.assign({
                    'Content-Type': 'application/json; charset=utf-8'
                }, authHeaders),
                body: JSON.stringify(payloadMap[fileInfo.key], null, 2)
            });

            if ([200, 201, 204].includes(response.status)) continue;
            if (response.status === 401 || response.status === 403) throw createWebDavError(i18n.__('webdav-sync-auth-failed'));

            let responseText = await readResponseTextSafe(response);
            throw createWebDavError(i18n.__('webdav-sync-upload-failed'), responseText);
        }

        await runWebDavSyncTestHook('before-upload-complete');

        return {
            ok: true,
            message: i18n.__('webdav-sync-upload-ok')
        };
    }

    async function fetchRemoteWebDavPayloads() {
        let config = validateWebDavSyncConfig();
        let authHeaders = buildWebDavAuthHeaders(config);
        let fetchedPayloads = {};

        for (let i = 0; i < WEBDAV_SYNC_FILES.length; i++) {
            let fileInfo = WEBDAV_SYNC_FILES[i];
            let response = await fetchWebDav(buildWebDavFileUrl(config, fileInfo.fileName), {
                method: 'GET',
                headers: authHeaders
            });

            if (response.status === 401 || response.status === 403) throw createWebDavError(i18n.__('webdav-sync-auth-failed'));
            if (response.status === 404) throw createWebDavError(i18n.__('webdav-sync-remote-missing') + ' ' + fileInfo.fileName);
            if (response.status !== 200) {
                let responseText = await readResponseTextSafe(response);
                throw createWebDavError(i18n.__('webdav-sync-download-failed'), responseText);
            }

            try {
                fetchedPayloads[fileInfo.key] = JSON.parse(await response.text());
            } catch (e) {
                throw createWebDavError(i18n.__('webdav-sync-invalid-remote'), e && e.message ? e.message : '');
            }
        }

        validateRemoteStorePayloads(fetchedPayloads);
        return fetchedPayloads;
    }

    function applyRemoteWebDavPayloads(fetchedPayloads) {
        applyRemoteWebDavPayloadsToStores(getStores(), fetchedPayloads);
    }

    async function downloadWebDavSync() {
        let fetchedPayloads = await fetchRemoteWebDavPayloads();
        await runWebDavSyncTestHook('before-download-apply');
        applyRemoteWebDavPayloads(fetchedPayloads);

        return {
            ok: true,
            message: i18n.__('webdav-sync-download-ok')
        };
    }

    async function executeStartupPullOperation(operation) {
        appendWebDavSyncLog('startup-sync-begin');
        if (!isWebDavConfigured()) {
            setWebDavAutoSyncReady(false, 'startup-not-configured');
            setWebDavSyncStatus('startupPull', 'idle', i18n.__('webdav-sync-auto-idle'), '', 'startupPull');
            lastSyncedCoreSignature = computeCoreSyncSignature();
            synchronizeWebDavObservedState('startup-skip');
            appendWebDavSyncLog('startup-sync-skip', 'webdav not configured');
            return {
                ok: true,
                skipped: true,
                message: i18n.__('webdav-sync-auto-idle')
            };
        }

        try {
            let remoteHasExistingData = await hasExistingRemoteWebDavData();
            if (!remoteHasExistingData) {
                setWebDavAutoSyncReady(false, 'startup-empty-remote');
                setWebDavSyncStatus('startupPull', 'idle', i18n.__('webdav-sync-auto-awaiting-initial-sync'), '', 'startupPull');
                lastSyncedCoreSignature = null;
                synchronizeWebDavObservedState('startup-empty-remote');
                appendWebDavSyncLog('startup-sync-skip', 'remote empty');
                return {
                    ok: true,
                    skipped: true,
                    message: i18n.__('webdav-sync-auto-awaiting-initial-sync')
                };
            }

            await runWithWebDavSyncSuppressed(async function () {
                await downloadWebDavSync();
            }, 'startup-internal-mutation', 'startupPull', operation.operationId);
            lastSyncedCoreSignature = computeCoreSyncSignature();
            synchronizeWebDavObservedState('startup-pull-success');
            if (webDavStartupMutationSuppressionToken == null) {
                webDavStartupMutationSuppressionToken = createWebDavSyncSuppressionToken('startup-internal-mutation', 'startup-tail', operation.operationId);
            }
            setWebDavAutoSyncReady(true, 'startup-pull-success');
            setWebDavSyncStatus('startupPull', 'success', i18n.__('webdav-sync-download-ok'), '', 'startupPull');
            appendWebDavSyncLog('startup-sync-success');
            return {
                ok: true,
                message: i18n.__('webdav-sync-download-ok')
            };
        } catch (e) {
            console.log(e);
            setWebDavAutoSyncReady(false, 'startup-pull-failed');
            setWebDavSyncStatus('startupPull', 'failed', i18n.__('webdav-sync-startup-failed'), e.detail || e.message || '', 'startupPull');
            notifyWebDavWarning(i18n.__('webdav-sync-startup-failed'));
            lastSyncedCoreSignature = null;
            synchronizeWebDavObservedState('startup-pull-failed-fallback');
            appendWebDavSyncLog('startup-sync-failed', e.detail || e.message || '');
            return toWebDavErrorPayload(e, i18n.__('webdav-sync-startup-failed'));
        }
    }

    async function executePullOperation(operation, statusKey, source) {
        try {
            await runWithWebDavSyncSuppressed(async function () {
                await downloadWebDavSync();
            }, 'manual-pull-apply', source, operation.operationId);
            lastSyncedCoreSignature = computeCoreSyncSignature();
            synchronizeWebDavObservedState(`${ source }-success`);
            resolvePendingWebDavOverwriteConfirm(`${ source }-success`);
            clearQueuedAutoPushes(`${ source }-completed`);
            setWebDavAutoSyncReady(true, `${ source }-success`);
            setWebDavSyncStatus(statusKey, 'success', i18n.__('webdav-sync-download-ok'), '', source);
            appendWebDavSyncLog('manual-pull-success', `${ source }#${ operation.operationId }`);
            return {
                ok: true,
                message: i18n.__('webdav-sync-download-ok')
            };
        } catch (e) {
            console.log(e);
            setWebDavSyncStatus(statusKey, 'failed', i18n.__('webdav-sync-download-failed'), e.detail || e.message || '', source);
            appendWebDavSyncLog('manual-pull-failed', `${ source }#${ operation.operationId } | ${ e.detail || e.message || '' }`);
            throw e;
        }
    }

    async function executePushOperation(operation) {
        let coordinator = ensureWebDavSyncCoordinator();
        let source = operation.type;
        let reason = operation.options.reason || source;
        let observed = observeWebDavLocalState(`${ source }:execute`);
        let failureMessage = operation.type === 'manualPush'
            ? i18n.__('webdav-sync-upload-failed')
            : i18n.__('webdav-sync-autopush-failed');

        if (!isWebDavConfigured()) {
            return {
                ok: true,
                skipped: true,
                message: i18n.__('webdav-sync-auto-idle')
            };
        }

        if (operation.type === 'autoPush' && !operation.options.ignoreSuppression && isWebDavAutoSyncSuppressed()) {
            appendWebDavSyncLog('auto-push-skip', `suppressed [${ reason }]`);
            return {
                ok: true,
                skipped: true,
                message: i18n.__('webdav-sync-auto-idle')
            };
        }

        if (coordinator.remoteWriteFrozen && !canOperationBypassWebDavWriteFreeze(operation)) {
            logWebDavWriteBlocked(operation, coordinator.remoteWriteFreezeReason || 'awaiting-confirmation');
            return {
                ok: true,
                skipped: true,
                blockedByFreeze: true,
                message: i18n.__('webdav-sync-auto-idle')
            };
        }

        if (operation.type !== 'manualPush' && observed.signature === lastSyncedCoreSignature) {
            appendWebDavSyncLog('auto-push-skip', `already-synced [${ reason }]`);
            return {
                ok: true,
                skipped: true,
                message: i18n.__('webdav-sync-upload-ok')
            };
        }

        let uploadTask = {
            taskId: coordinator.nextUploadTaskId++,
            startSignature: observed.signature,
            startVersion: observed.stateVersion
        };

        if (operation.type !== 'manualPush' || operation.options.confirmOverwrite === true) {
            setWebDavSyncStatus('lastPush', 'syncing', i18n.__('webdav-sync-autopush-running'), '', source);
        }

        appendWebDavSyncLog('auto-push-attempt', `${ reason } | task=${ uploadTask.taskId } | v=${ uploadTask.startVersion }`);

        try {
            let result = await uploadWebDavSync(operation.type === 'manualPush' ? operation.options.confirmOverwrite === true : true);
            if (result && result.needsConfirm) {
                freezeWebDavRemoteWriteLane('awaitingManualOverwriteConfirm', operation.operationId);
                return result;
            }

            let currentSignature = computeCoreSyncSignature();
            let stale = coordinator.stateVersion !== uploadTask.startVersion || currentSignature !== uploadTask.startSignature;

            if (!stale) {
                lastSyncedCoreSignature = uploadTask.startSignature;
            } else {
                appendWebDavSyncLog('auto-push-stale-completion', `${ reason } | task=${ uploadTask.taskId } | current-v=${ coordinator.stateVersion }`);
                if (currentSignature !== lastSyncedCoreSignature) {
                    requestWebDavIntentInBackground('autoPush', {
                        reason: 'reconcile',
                        ignoreSuppression: true
                    });
                }
            }

            if (operation.type === 'manualPush') {
                resolvePendingWebDavOverwriteConfirm('manual-push-success');
                setWebDavAutoSyncReady(true, 'manual-push-success');
            }
            setWebDavSyncStatus('lastPush', 'success', i18n.__('webdav-sync-upload-ok'), '', source);
            appendWebDavSyncLog('auto-push-success', `${ reason } | task=${ uploadTask.taskId }${ stale ? ' | stale' : '' }`);
            return result;
        } catch (e) {
            console.log(e);
            setWebDavSyncStatus('lastPush', 'failed', failureMessage, (e.detail || e.message || '') + (reason ? ' [' + reason + ']' : ''), source);
            appendWebDavSyncLog('auto-push-failed', `${ reason } | task=${ uploadTask.taskId } | ${ e.detail || e.message || '' }`);
            throw e;
        }
    }

    async function performStartupWebDavSync() {
        await requestWebDavIntent('startupPull');
    }

    function clearWebDavWatchers() {
        let stores = getStores();
        if (webDavAutoPushTimer) {
            clearTimeout(webDavAutoPushTimer);
            webDavAutoPushTimer = null;
        }
        if (stores.store != null && stores.store.path) fs.unwatchFile(stores.store.path);
        if (stores.statistics != null && stores.statistics.path) fs.unwatchFile(stores.statistics.path);
        if (stores.recapStore != null && stores.recapStore.path) fs.unwatchFile(stores.recapStore.path);
        webDavWatchersStarted = false;
    }

    async function performAutoWebDavPush(reason, ignoreSuppression) {
        return await requestWebDavIntent('autoPush', {
            reason: reason,
            ignoreSuppression: ignoreSuppression === true
        });
    }

    function scheduleAutoWebDavPush(reason) {
        if (!isWebDavConfigured()) return;
        if (!isWebDavAutoSyncReady()) return;
        if (isWebDavAutoSyncSuppressed()) return;
        if (webDavAutoPushTimer) clearTimeout(webDavAutoPushTimer);
        appendWebDavSyncLog('auto-push-scheduled', reason || 'unknown');
        webDavAutoPushTimer = setTimeout(async function () {
            try {
                await runWebDavSyncTestHook('watcher-delay', reason || 'unknown');
                await performAutoWebDavPush(reason);
            } catch (e) {
                console.log(e);
                appendWebDavSyncLog('auto-push-timer-failed', e.detail || e.message || '');
            }
        }, 1500);
    }

    function startWebDavAutoPushWatchers() {
        let stores = getStores();
        if (webDavWatchersStarted) return;

        [
            { path: stores.store.path, reason: 'config' },
            { path: stores.statistics.path, reason: 'statistics' },
            { path: stores.recapStore.path, reason: 'recap' }
        ].forEach(function (item) {
            fs.watchFile(item.path, { interval: 1000 }, function (curr, prev) {
                if (curr.mtimeMs === prev.mtimeMs) return;
                appendWebDavSyncLog('watcher-change-detected', item.reason);
                scheduleAutoWebDavPush(item.reason);
            });
        });

        webDavWatchersStarted = true;
    }

    function handleCustomDialogAction(message) {
        let authority = ensureExitAuthority();
        if (authority.pendingDecisionResolver == null) return;
        if (!message || message.exitSessionId !== authority.sessionId) {
            appendWebDavSyncLog('stale-exit-session-drop', `action | expected=${ authority.sessionId } actual=${ message && message.exitSessionId }`);
            return;
        }
        let decision = 'force-quit';
        if (authority.dialogState === 'initial-sync-choice') {
            decision = message.action === 'primary' ? 'upload-local' : 'download-cloud';
        } else if (authority.dialogState === 'timeout') {
            decision = message.action === 'primary' ? 'wait' : 'force-quit';
        } else if (authority.dialogState === 'failed') {
            decision = message.action === 'primary' ? 'retry' : 'force-quit';
        }
        authority.pendingDecisionResolver(decision);
    }

    async function initialize() {
        ensureWebDavSyncCoordinator();
        try {
            await migrateLegacyWebDavPasswordIfNeeded();
        } catch (e) {
            console.log(e);
            cachedWebDavCredentialError = e && e.message ? e.message : String(e);
        }
        await refreshCachedWebDavPassword();
        webDavCoordinator.lastObservedSignature = computeCoreSyncSignature();
    }

    function finalizeStartup() {
        if (webDavStartupMutationSuppressionToken != null) {
            releaseWebDavSyncSuppressionToken(webDavStartupMutationSuppressionToken);
            webDavStartupMutationSuppressionToken = null;
        }
        startWebDavAutoPushWatchers();
    }

    function isExitFinalizing() {
        return ensureExitAuthority().finalizing === true;
    }

    function registerIpcHandlers() {
        if (ipcHandlersRegistered) return;
        ipcHandlersRegistered = true;

        ipcMain.handle('webdav-sync-test', async function () {
            try {
                let result = await testWebDavConnection();
                let remoteHasExistingData = await hasExistingRemoteWebDavData();
                setWebDavAutoSyncReady(!remoteHasExistingData, remoteHasExistingData ? 'test-success-remote-has-data' : 'test-success-empty-remote');
                setWebDavSyncStatus('lastTest', 'success', result.message, '', 'testConnection');
                return result;
            } catch (e) {
                console.log(e);
                setWebDavSyncStatus('lastTest', 'failed', i18n.__('webdav-sync-connection-failed'), e.detail || e.message || '', 'testConnection');
                return toWebDavErrorPayload(e, i18n.__('webdav-sync-connection-failed'));
            }
        });

        ipcMain.handle('webdav-sync-status', function () {
            return Object.assign({
                configured: isWebDavConfigured()
            }, getWebDavSyncStatus());
        });

        ipcMain.handle('webdav-config:getUiState', async function () {
            return await getWebDavConfigUiState();
        });

        ipcMain.handle('webdav-config:setNonSensitive', async function (event, payload) {
            return await persistNonSensitiveWebDavConfig(payload || {});
        });

        ipcMain.handle('webdav-config:setPassword', async function (event, payload) {
            return await setWebDavPassword(payload && payload.password);
        });

        ipcMain.handle('webdav-config:clearPassword', async function () {
            return await clearWebDavPassword();
        });

        ipcMain.handle('webdav-sync-cancel-overwrite-confirm', function () {
            cancelPendingWebDavOverwriteConfirm();
            return {
                ok: true
            };
        });

        ipcMain.handle('webdav-sync-upload', async function (event, payload) {
            try {
                return await requestWebDavIntent('manualPush', {
                    confirmOverwrite: payload && payload.confirmOverwrite === true,
                    reason: 'manual-upload',
                    explicitUserAction: true
                });
            } catch (e) {
                console.log(e);
                return toWebDavErrorPayload(e, i18n.__('webdav-sync-upload-failed'));
            }
        });

        ipcMain.handle('webdav-sync-download', async function () {
            try {
                return await requestWebDavIntent('manualPull', {
                    reason: 'manual-download'
                });
            } catch (e) {
                console.log(e);
                return toWebDavErrorPayload(e, i18n.__('webdav-sync-download-failed'));
            }
        });
    }

    return {
        initialize: initialize,
        finalizeStartup: finalizeStartup,
        clearWatchers: clearWebDavWatchers,
        performStartupSync: performStartupWebDavSync,
        requestAppExitWithGuard: requestAppExitWithGuard,
        handleCustomDialogAction: handleCustomDialogAction,
        registerIpcHandlers: registerIpcHandlers,
        appendSyncLog: appendWebDavSyncLog,
        isExitFinalizing: isExitFinalizing
    };
}

module.exports = {
    createWebDavSyncService: createWebDavSyncService,
    _test: {
        WEBDAV_SYNC_CONFIG_KEY: WEBDAV_SYNC_CONFIG_KEY,
        WEBDAV_AUTO_SYNC_READY_KEY: WEBDAV_AUTO_SYNC_READY_KEY,
        WEBDAV_UNSYNCED_EXIT_MARKER_KEY: WEBDAV_UNSYNCED_EXIT_MARKER_KEY,
        WEBDAV_EXCLUDED_CONFIG_KEYS: WEBDAV_EXCLUDED_CONFIG_KEYS.slice(),
        cloneStoreData: cloneStoreData,
        createWebDavError: createWebDavError,
        toWebDavErrorPayload: toWebDavErrorPayload,
        getLatestWebDavFailureDetailFromStatus: getLatestWebDavFailureDetailFromStatus,
        buildSyncConfigPayloadFromStore: buildSyncConfigPayloadFromStore,
        applyRemoteWebDavPayloadsToStores: applyRemoteWebDavPayloadsToStores
    }
};
