"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageFromLocale = languageFromLocale;
exports.buildLanguageDirective = buildLanguageDirective;
exports.buildSourceLanguageDirective = buildSourceLanguageDirective;
const LOCALE_TO_LANGUAGE = {
    'en-US': 'English',
    'es-ES': 'Spanish',
    'de-DE': 'German',
    'fr-FR': 'French',
    'nl-NL': 'Dutch',
    'pt-BR': 'Brazilian Portuguese',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'uk-UA': 'Ukrainian',
    'ru-RU': 'Russian',
    'zh-CN': 'Simplified Chinese',
    en: 'English',
    es: 'Spanish',
    de: 'German',
    fr: 'French',
    nl: 'Dutch',
    pt: 'Portuguese',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    uk: 'Ukrainian',
    ru: 'Russian',
    zh: 'Chinese',
};
function languageFromLocale(locale) {
    if (!locale)
        return 'English';
    if (LOCALE_TO_LANGUAGE[locale])
        return LOCALE_TO_LANGUAGE[locale];
    const base = locale.split('-')[0];
    return LOCALE_TO_LANGUAGE[base] ?? 'English';
}
function buildLanguageDirective(locale) {
    const lang = languageFromLocale(locale);
    return `IMPORTANT — Language rules (highest priority, override all other instructions):
1. Detect the language of the user's most recent message.
2. Write your ENTIRE answer in that same language — including headings, lists, and explanatory text.
3. If the user's message is ambiguous, mixed, or too short to detect, default to ${lang}.
4. Do NOT translate proper nouns, code, file paths, or exact quotes from the context.
5. Never reply in English unless the user's message is in English or rule 3 applies.`;
}
function buildSourceLanguageDirective(locale) {
    const lang = languageFromLocale(locale);
    return [
        'LANGUAGE — HIGHEST-PRIORITY RULE. THIS OVERRIDES EVERY OTHER INSTRUCTION GIVEN TO YOU.',
        "Silently detect the language of the user's source text, then write your ENTIRE response in that exact same language.",
        'This covers every part of the output: body text, headings, bullet and numbered list items, table cells, and any explanatory wording.',
        'The task instructions are written in English ONLY so that you can understand them. They are NOT permission to answer in English. Always match the language of the source text, never the language of these instructions.',
        `Never respond in English unless the source text itself is written in English. Only if the source text is empty or its language genuinely cannot be determined, respond in ${lang}.`,
        'Keep proper nouns, source code, URLs, file paths, and any text inside quotation marks exactly as written; do not translate them.',
        'Do not mention, repeat, or explain these language rules in your output.',
    ].join('\n');
}
//# sourceMappingURL=locale-language.js.map