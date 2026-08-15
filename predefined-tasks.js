'use strict';

const PREDEFINED_TASK_NAME_MAX_LENGTH = 128;
const MAX_PREDEFINED_TASKS = 100;
const MIN_TASK_MINUTES = 0.083;
const MAX_TASK_MINUTES = 1000;
const MIN_LOOPS = 1;
const MAX_LOOPS = 99;

function sanitizeTaskName(name) {
    if (typeof name !== 'string') return '';
    let cleaned = name.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    if (cleaned.length > PREDEFINED_TASK_NAME_MAX_LENGTH) {
        cleaned = cleaned.slice(0, PREDEFINED_TASK_NAME_MAX_LENGTH);
    }
    return cleaned;
}

function clampTaskMinutes(value) {
    let minutes = Number(value);
    if (!Number.isFinite(minutes)) return null;
    if (minutes < MIN_TASK_MINUTES) minutes = MIN_TASK_MINUTES;
    if (minutes > MAX_TASK_MINUTES) minutes = MAX_TASK_MINUTES;
    return minutes;
}

function clampLoops(value) {
    let loops = Number(value);
    if (!Number.isFinite(loops)) return null;
    loops = Math.round(loops);
    if (loops < MIN_LOOPS) loops = MIN_LOOPS;
    if (loops > MAX_LOOPS) loops = MAX_LOOPS;
    return loops;
}

function sanitizePredefinedTask(item) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) return null;
    let name = sanitizeTaskName(item.name);
    if (name === '') return null;
    let workTime = clampTaskMinutes(item.workTime);
    let restTime = clampTaskMinutes(item.restTime);
    let loops = clampLoops(item.loops);
    if (workTime === null || restTime === null || loops === null) return null;
    return {
        name: name,
        workTime: workTime,
        restTime: restTime,
        loops: loops,
        focusWhenWorking: item.focusWhenWorking === true,
        focusWhenResting: item.focusWhenResting === true
    };
}

function sanitizePredefinedTasks(list) {
    if (!Array.isArray(list)) return [];
    let sanitized = [];
    for (let i = 0; i < list.length && sanitized.length < MAX_PREDEFINED_TASKS; i++) {
        let task = sanitizePredefinedTask(list[i]);
        if (task) sanitized.push(task);
    }
    return sanitized;
}

function isWellFormedRemoteTask(item) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) return false;
    if (typeof item.name !== 'string') return false;
    if (item.name.length > PREDEFINED_TASK_NAME_MAX_LENGTH) return false;
    if (!Number.isFinite(Number(item.workTime))) return false;
    if (!Number.isFinite(Number(item.restTime))) return false;
    if (!Number.isFinite(Number(item.loops))) return false;
    if (item.focusWhenWorking != null && typeof item.focusWhenWorking !== 'boolean') return false;
    if (item.focusWhenResting != null && typeof item.focusWhenResting !== 'boolean') return false;
    return true;
}

function isValidRemotePredefinedTasks(value) {
    if (value === undefined) return true;
    if (!Array.isArray(value)) return false;
    if (value.length > MAX_PREDEFINED_TASKS) return false;
    for (let i = 0; i < value.length; i++) {
        if (!isWellFormedRemoteTask(value[i])) return false;
    }
    return true;
}

function sanitizeDefaultTaskIndex(value, taskCount) {
    let index = Number(value);
    if (!Number.isInteger(index) || index < -1 || index >= taskCount) return -1;
    return index;
}

function remapDefaultTaskIndex(list, defaultTask) {
    let requested = Number(defaultTask);
    if (!Number.isInteger(requested) || requested < 0 || !Array.isArray(list) || requested >= list.length) {
        return -1;
    }
    let kept = 0;
    for (let i = 0; i < list.length && kept < MAX_PREDEFINED_TASKS; i++) {
        let task = sanitizePredefinedTask(list[i]);
        if (!task) {
            if (i === requested) return -1;
            continue;
        }
        if (i === requested) return kept;
        kept++;
    }
    return -1;
}

function persistSanitizedPredefinedTasks(store) {
    if (store == null || typeof store.get !== 'function' || typeof store.set !== 'function') return [];
    let original = store.get('predefined-tasks');
    let remappedDefault = remapDefaultTaskIndex(original, store.get('default-task', -1));
    let sanitized = sanitizePredefinedTasks(original);
    store.set('predefined-tasks', sanitized);
    store.set('default-task', remappedDefault);
    return sanitized;
}

module.exports = {
    PREDEFINED_TASK_NAME_MAX_LENGTH: PREDEFINED_TASK_NAME_MAX_LENGTH,
    MAX_PREDEFINED_TASKS: MAX_PREDEFINED_TASKS,
    sanitizeTaskName: sanitizeTaskName,
    sanitizePredefinedTask: sanitizePredefinedTask,
    sanitizePredefinedTasks: sanitizePredefinedTasks,
    isValidRemotePredefinedTasks: isValidRemotePredefinedTasks,
    sanitizeDefaultTaskIndex: sanitizeDefaultTaskIndex,
    remapDefaultTaskIndex: remapDefaultTaskIndex,
    persistSanitizedPredefinedTasks: persistSanitizedPredefinedTasks
};
