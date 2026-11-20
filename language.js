'use strict';

const LANGUAGE_CODES = ['en', 'zh-CN', 'zh-TW', 'ko', 'ar', 'fr'];

// Maps a system locale (or a stored language) to one of the languages wnr ships.
// zh-TW, zh-HK, zh-MO and any Hant script read Traditional Chinese; other Chinese reads Simplified;
// anything wnr does not ship falls back to English, so the Languages selector always has a match.
function resolveLanguage(locale, codes = LANGUAGE_CODES) {
    if (typeof locale !== 'string' || locale.trim() === '') return 'en';
    const lower = locale.trim().replace(/_/g, '-').toLowerCase();
    const exact = codes.find(code => code.toLowerCase() === lower);
    if (exact) return exact;
    const primary = lower.split('-')[0];
    if (primary === 'zh') return /^zh-(tw|hk|mo|hant)\b/.test(lower) ? 'zh-TW' : 'zh-CN';
    return codes.find(code => code.toLowerCase().split('-')[0] === primary) || 'en';
}

module.exports = { LANGUAGE_CODES, resolveLanguage };
