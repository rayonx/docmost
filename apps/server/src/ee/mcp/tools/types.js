"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpError = mcpError;
exports.mcpResult = mcpResult;
exports.validatePageInWorkspace = validatePageInWorkspace;
function mcpError(text) {
    return { content: [{ type: 'text', text }], isError: true };
}
function mcpResult(data) {
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function validatePageInWorkspace(page, workspaceId) {
    return !!page && page.workspaceId === workspaceId && !page.deletedAt;
}
//# sourceMappingURL=types.js.map