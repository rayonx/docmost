"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldCompress = shouldCompress;
exports.splitForCompression = splitForCompression;
exports.compressHistory = compressHistory;
const ai_1 = require("ai");
const token_counter_1 = require("./token-counter");
const COMPRESSION_TRIGGER_RATIO = 0.7;
const RECENT_KEEP_RATIO = 0.3;
function shouldCompress(history, availableTokens) {
    const totalTokens = history.reduce((sum, msg) => sum + getTokenCount(msg), 0);
    return totalTokens > availableTokens * COMPRESSION_TRIGGER_RATIO;
}
function splitForCompression(history, availableTokens) {
    const recentTokenBudget = availableTokens * RECENT_KEEP_RATIO;
    let recentTokens = 0;
    let splitIdx = history.length;
    for (let i = history.length - 1; i >= 0; i--) {
        const tokens = getTokenCount(history[i]);
        if (recentTokens + tokens > recentTokenBudget)
            break;
        recentTokens += tokens;
        splitIdx = i;
    }
    if (splitIdx >= history.length) {
        splitIdx = history.length - 1;
    }
    while (splitIdx > 0 && history[splitIdx].role !== 'user') {
        splitIdx--;
    }
    if (splitIdx <= 0) {
        return { older: [], recent: history };
    }
    return {
        older: history.slice(0, splitIdx),
        recent: history.slice(splitIdx),
    };
}
async function compressHistory(model, older) {
    const transcript = older
        .map((msg) => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'User';
        const content = msg.content || '';
        if (msg.toolCalls && Array.isArray(msg.toolCalls)) {
            const toolNames = msg.toolCalls
                .map((tc) => tc.name)
                .join(', ');
            return `${role}: ${content}\n[Used tools: ${toolNames}]`;
        }
        return `${role}: ${content}`;
    })
        .join('\n\n');
    const { text } = await (0, ai_1.generateText)({
        model,
        system: `You are a conversation summarizer. Summarize the following conversation history concisely, preserving:
- Key facts and decisions made
- Important page names, IDs, and search results mentioned
- User requests and what was accomplished
- Any unresolved questions or pending tasks

Be concise but complete. Use bullet points. Do not include greetings or filler.`,
        prompt: transcript,
        maxOutputTokens: 1024,
    });
    return text;
}
function getTokenCount(msg) {
    const meta = msg.metadata;
    if (meta?.tokenCount && typeof meta.tokenCount === 'number') {
        return meta.tokenCount;
    }
    return (0, token_counter_1.countMessageTokens)(msg.role, msg.content, msg.toolCalls);
}
//# sourceMappingURL=history-compressor.js.map