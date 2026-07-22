function getSettingsWindowWidth(locale) {
    if (locale != null && locale.indexOf('zh') === 0) return 420;
    return locale === 'fr' ? 520 : 472;
}

module.exports = { getSettingsWindowWidth };
