function getLanguageValue(values, locale) {
    if (values == null) return undefined;
    return values[locale] === undefined ? values.en : values[locale];
}

module.exports = { getLanguageValue };
