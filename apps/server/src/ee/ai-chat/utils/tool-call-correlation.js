"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlateToolCallsWithResults = correlateToolCallsWithResults;
const MISSING_RESULT = { error: 'tool did not return a result' };
function correlateToolCallsWithResults(calls, results) {
    const resultById = new Map();
    for (const r of results ?? []) {
        if (r && typeof r.toolCallId === 'string') {
            resultById.set(r.toolCallId, r);
        }
    }
    const out = [];
    for (const call of calls ?? []) {
        const match = resultById.get(call.toolCallId);
        const hasValidOutput = match !== undefined && match.output !== undefined && match.output !== null;
        out.push({
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            input: call.input,
            result: hasValidOutput ? match.output : { ...MISSING_RESULT },
        });
    }
    return out;
}
//# sourceMappingURL=tool-call-correlation.js.map