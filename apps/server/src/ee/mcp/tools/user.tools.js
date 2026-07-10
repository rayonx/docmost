"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserTools = registerUserTools;
const v4_1 = require("zod/v4");
const types_1 = require("./types");
function registerUserTools({ server, user, workspace, }) {
    server.registerTool('get_current_user', {
        title: 'Get Current User',
        description: 'Get information about the currently authenticated user and their workspace.',
        inputSchema: v4_1.z.object({}),
    }, async () => {
        return (0, types_1.mcpResult)({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                locale: user.locale,
            },
            workspace: {
                id: workspace.id,
                name: workspace.name,
            },
        });
    });
}
//# sourceMappingURL=user.tools.js.map