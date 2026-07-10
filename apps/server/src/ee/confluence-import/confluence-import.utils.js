"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confluenceStatusColorMap = exports.confluenceEmoticonMap = void 0;
exports.fixSelfClosingTags = fixSelfClosingTags;
const htmlVoidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
function fixSelfClosingTags(html) {
    return html.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\/>/g, (match, tag, attrs) => {
        if (htmlVoidElements.has(tag.toLowerCase())) {
            return match;
        }
        return `<${tag}${attrs}></${tag}>`;
    });
}
exports.confluenceEmoticonMap = {
    'smile': '\u{1F642}',
    'sad': '\u{1F61E}',
    'cheeky': '\u{1F61B}',
    'laugh': '\u{1F600}',
    'wink': '\u{1F609}',
    'thumbs-up': '\u{1F44D}',
    'thumbs-down': '\u{1F44E}',
    'information': '\u{2139}\u{FE0F}',
    'info': '\u{2139}\u{FE0F}',
    'tick': '\u{2705}',
    'cross': '\u{274C}',
    'error': '\u{274C}',
    'warning': '\u{26A0}\u{FE0F}',
    'plus': '\u{2795}',
    'minus': '\u{2796}',
    'question': '\u{2753}',
    'light-on': '\u{1F4A1}',
    'light-off': '\u{1F4A1}',
    'yellow-star': '\u{2B50}',
    'star': '\u{2B50}',
    'red-star': '\u{2B50}',
    'green-star': '\u{2B50}',
    'blue-star': '\u{2B50}',
    'heart': '\u{2764}\u{FE0F}',
    'broken-heart': '\u{1F494}',
};
exports.confluenceStatusColorMap = {
    'aui-lozenge-success': 'green',
    'aui-lozenge-complete': 'green',
    'aui-lozenge-error': 'red',
    'aui-lozenge-removed': 'red',
    'aui-lozenge-current': 'blue',
    'aui-lozenge-inprogress': 'blue',
    'aui-lozenge-moved': 'yellow',
    'aui-lozenge-new': 'purple',
};
//# sourceMappingURL=confluence-import.utils.js.map