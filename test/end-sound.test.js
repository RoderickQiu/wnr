'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { isCustomSound, normalizeSoundChoice, resolveSoundSource } = require('../end-sound');

test('the custom end sound is recognised in every language it was ever saved in', () => {
    for (const word of ['custom', '自定义', '自定義', '사용자 지정', 'مخصص', 'personnalisé', '⁨مخصص⁩'])
        assert.ok(isCustomSound(word), word);
    for (const word of ['tick', 'piano', '', undefined])
        assert.ok(!isCustomSound(word), String(word));
});

test('stored choices are normalised to language-independent values', () => {
    assert.equal(normalizeSoundChoice('自定义', 'tick'), 'custom');
    assert.equal(normalizeSoundChoice('⁨مخصص⁩', 'piano'), 'custom');
    assert.equal(normalizeSoundChoice('whistle', 'tick'), 'whistle');
    assert.equal(normalizeSoundChoice('nonsense', 'piano'), 'piano');
});

test('a custom choice plays the custom file in any app language, else the fallback', () => {
    const builtIn = name => path.join(__dirname, '..', 'res', 'sound', name + '.mp3');
    // saved as "自定义" in Chinese, played after switching to English: still the custom file
    assert.equal(resolveSoundSource('自定义', ['/Users/me/bell.mp3'], 'tick'), '/Users/me/bell.mp3');
    assert.equal(resolveSoundSource('custom', ['', '/Users/me/work.mp3'], 'tick'), '/Users/me/work.mp3');
    assert.equal(resolveSoundSource('custom', ['', undefined], 'piano'), builtIn('piano'));
    assert.equal(resolveSoundSource('beep', ['/Users/me/bell.mp3'], 'tick'), builtIn('beep'));
    assert.equal(resolveSoundSource('custom.mp3', [], 'tick'), builtIn('tick'));
});
