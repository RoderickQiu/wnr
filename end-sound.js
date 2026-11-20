'use strict';

const fs = require('fs');
const path = require('path');

const CUSTOM_SOUND = 'custom';
const BUILT_IN_SOUNDS = ['alarming', 'beep', 'clock', 'tick', 'trumpet', 'whistle', 'horns', 'magic', 'piano'];

// Before this module, the custom choice was stored as the word "custom" in whatever language the
// app was in, so every translation of it (with or without Arabic isolation marks) still means custom.
let legacyNames = null;
function customSoundNames() {
    if (legacyNames) return legacyNames;
    legacyNames = new Set([CUSTOM_SOUND]);
    try {
        const dir = path.join(__dirname, 'locales');
        for (const file of fs.readdirSync(dir)) {
            if (!file.endsWith('.json')) continue;
            const word = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')).custom;
            if (typeof word === 'string' && word.trim()) legacyNames.add(word.trim());
        }
    } catch (e) {
        console.log(e);
    }
    return legacyNames;
}

function isCustomSound(value) {
    if (typeof value !== 'string') return false;
    return customSoundNames().has(value.replace(/[⁦-⁩]/g, '').trim());
}

// What a stored choice should be saved as from now on: 'custom' or a built-in sound name.
function normalizeSoundChoice(value, fallback) {
    if (isCustomSound(value)) return CUSTOM_SOUND;
    return BUILT_IN_SOUNDS.indexOf(value) !== -1 ? value : fallback;
}

function builtInSoundPath(name) {
    return path.join(__dirname, 'res', 'sound', name + '.mp3');
}

// The file to play for a choice. customPaths are tried in order; an empty or missing one falls
// back to the built-in fallback sound.
function resolveSoundSource(choice, customPaths, fallback) {
    if (isCustomSound(choice)) {
        for (const p of customPaths || []) if (typeof p === 'string' && p.trim() !== '') return p;
        return builtInSoundPath(fallback);
    }
    return builtInSoundPath(BUILT_IN_SOUNDS.indexOf(choice) !== -1 ? choice : fallback);
}

module.exports = { CUSTOM_SOUND, BUILT_IN_SOUNDS, isCustomSound, normalizeSoundChoice, resolveSoundSource, builtInSoundPath };
