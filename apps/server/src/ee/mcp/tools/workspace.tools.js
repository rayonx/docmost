"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWorkspaceTools = registerWorkspaceTools;
const v4_1 = require("zod/v4");
const workspace_ability_type_1 = require("../../../core/casl/interfaces/workspace-ability.type");
const types_1 = require("./types");
function registerWorkspaceTools(ctx, deps) {
    registerListWorkspaceMembers(ctx, deps);
}
function registerListWorkspaceMembers({ server, user, workspace }, deps) {
    server.registerTool('list_workspace_members', {
        title: 'List Workspace Members',
        description: 'List members of the current workspace. Supports filtering by name or email.',
        inputSchema: v4_1.z.object({
            query: v4_1.z
                .string()
                .optional()
                .describe('Filter members by name or email'),
            limit: v4_1.z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .default(20)
                .describe('Maximum number of results (1-100)'),
            cursor: v4_1.z.string().optional().describe('Pagination cursor'),
        }),
    }, async (args) => {
        try {
            const ability = deps.workspaceAbility.createForUser(user, workspace);
            if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Read, workspace_ability_type_1.WorkspaceCaslSubject.Member)) {
                return (0, types_1.mcpError)('You do not have permission to list workspace members');
            }
            const result = await deps.workspaceService.getWorkspaceUsers(workspace.id, {
                limit: args.limit,
                cursor: args.cursor,
                query: args.query,
            });
            return (0, types_1.mcpResult)(result);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
//# sourceMappingURL=workspace.tools.js.map