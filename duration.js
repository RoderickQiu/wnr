'use strict';

// Typed durations are read by node-shi, which drops commas as thousands separators, so a decimal
// comma ("1,5 h" in Spanish, French, Vietnamese...) became 15 hours. A comma between two digits is
// read as a decimal point instead; nobody types a duration in the thousands of minutes.
// node-shi also knows only Simplified 小时, so Traditional 小時 / 鐘頭 are mapped to it.
// A bare number after hours ("1h30", like a clock) is minutes; node-shi silently dropped it.
function normalizeDurationText(raw) {
    if (raw == null) return raw;
    return String(raw).replace(/(\d),(?=\d)/g, '$1.').replace(/小時|鐘頭/g, '小时')
        .replace(/(\d\s*(?:h|hrs?|hours?|小时)\s*)(\d+(?:\.\d+)?)\s*$/i, '$1$2min');
}

module.exports = { normalizeDurationText };
