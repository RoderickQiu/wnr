'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveLanguage } = require('../language');

test('Traditional Chinese systems start in Traditional Chinese', () => {
    for (const locale of ['zh-TW', 'zh-HK', 'zh-MO', 'zh_TW', 'zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK'])
        assert.equal(resolveLanguage(locale), 'zh-TW', locale);
    for (const locale of ['zh', 'zh-CN', 'zh-SG', 'zh-Hans', 'zh-Hans-CN'])
        assert.equal(resolveLanguage(locale), 'zh-CN', locale);
});

test('shipped languages match by primary subtag; anything else is English', () => {
    assert.equal(resolveLanguage('fr-CA'), 'fr');
    assert.equal(resolveLanguage('ko-KR'), 'ko');
    assert.equal(resolveLanguage('ar-EG'), 'ar');
    assert.equal(resolveLanguage('en-GB'), 'en');
    assert.equal(resolveLanguage('zh-CN'), 'zh-CN');
    for (const locale of ['de', 'de-DE', 'ja', 'pt-BR', 'es', '', undefined, null, 42])
        assert.equal(resolveLanguage(locale), 'en', String(locale));
});
