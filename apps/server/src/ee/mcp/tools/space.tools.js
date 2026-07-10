"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSpaceTools = registerSpaceTools;
const v4_1 = require("zod/v4");
const space_ability_type_1 = require("../../../core/casl/interfaces/space-ability.type");
const workspace_ability_type_1 = require("../../../core/casl/interfaces/workspace-ability.type");
const types_1 = require("./types");
function registerSpaceTools(ctx, deps) {
    registerGetSpace(ctx, deps);
    registerListSpaces(ctx, deps);
    registerCreateSpace(ctx, deps);
    registerUpdateSpace(ctx, deps);
}
function registerGetSpace({ server, user, workspace }, deps) {
    server.registerTool('get_space', {
        title: 'Get Space',
        description: 'Get space information including member count.',
        inputSchema: v4_1.z.object({
            spaceId: v4_1.z.string().uuid().describe('Space ID'),
        }),
    }, async (args) => {
        try {
            const space = await deps.spaceService.getSpaceInfo(args.spaceId, workspace.id);
            if (!space) {
                return (0, types_1.mcpError)('Space not found');
            }
            const ability = await deps.spaceAbility.createForUser(user, space.id);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Settings)) {
                return (0, types_1.mcpError)('You do not have permission to access this space');
            }
            return (0, types_1.mcpResult)(space);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerListSpaces({ server, user }, deps) {
    server.registerTool('list_spaces', {
        title: 'List Spaces',
        description: 'List spaces the user has access to. Supports filtering by name.',
        inputSchema: v4_1.z.object({
            query: v4_1.z.string().optional().describe('Filter spaces by name'),
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
            const result = await deps.spaceMemberService.getUserSpaces(user.id, {
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
function registerCreateSpace({ server, user, workspace }, deps) {
    server.registerTool('create_space', {
        title: 'Create Space',
        description: 'Create a new space in the workspace. Requires workspace admin or owner role. The creating user is automatically added as a space admin.',
        inputSchema: v4_1.z.object({
            name: v4_1.z
                .string()
                .min(2)
                .max(100)
                .describe('Space name (2-100 characters)'),
            slug: v4_1.z
                .string()
                .min(2)
                .max(100)
                .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, 'Slug must start with a letter or number and may contain hyphens and underscores')
                .describe('URL-friendly slug (2-100 chars; letters, numbers, hyphens, underscores; must start with a letter or number)'),
            description: v4_1.z.string().optional().describe('Space description'),
        }),
    }, async (args) => {
        try {
            const ability = deps.workspaceAbility.createForUser(user, workspace);
            if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Space)) {
                return (0, types_1.mcpError)('You do not have permission to create spaces. Requires workspace admin or owner role.');
            }
            const space = await deps.spaceService.createSpace(user, workspace.id, {
                name: args.name.trim(),
                slug: args.slug,
                description: args.description,
            });
            return (0, types_1.mcpResult)(space);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerUpdateSpace({ server, user, workspace }, deps) {
    server.registerTool('update_space', {
        title: 'Update Space',
        description: 'Update a space name, slug, or description. Requires space admin role.',
        inputSchema: v4_1.z.object({
            spaceId: v4_1.z.string().uuid().describe('Space ID to update'),
            name: v4_1.z
                .string()
                .min(2)
                .max(100)
                .optional()
                .describe('New space name'),
            slug: v4_1.z
                .string()
                .min(2)
                .max(100)
                .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, 'Slug must start with a letter or number and may contain hyphens and underscores')
                .optional()
                .describe('New URL-friendly slug (letters, numbers, hyphens, underscores; must start with a letter or number)'),
            description: v4_1.z.string().optional().describe('New space description'),
        }),
    }, async (args) => {
        try {
            const ability = await deps.spaceAbility.createForUser(user, args.spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Settings)) {
                return (0, types_1.mcpError)('You do not have permission to update this space');
            }
            const space = await deps.spaceService.updateSpace({
                spaceId: args.spaceId,
                name: args.name,
                slug: args.slug,
                description: args.description,
            }, workspace.id);
            return (0, types_1.mcpResult)(space);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
//# sourceMappingURL=space.tools.js.map