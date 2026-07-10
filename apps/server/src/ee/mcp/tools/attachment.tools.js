"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAttachmentTools = registerAttachmentTools;
const v4_1 = require("zod/v4");
const space_ability_type_1 = require("../../../core/casl/interfaces/space-ability.type");
const types_1 = require("./types");
function registerAttachmentTools({ server, user, workspace }, deps) {
    server.registerTool('search_attachments', {
        title: 'Search Attachments',
        description: 'Search for attachments (PDF, DOCX) across pages the user has access to. Returns matching attachments with highlighted snippets.',
        inputSchema: v4_1.z.object({
            query: v4_1.z.string().describe('Search query text'),
            spaceId: v4_1.z
                .uuid()
                .optional()
                .describe('Filter results to a specific space'),
            limit: v4_1.z
                .number()
                .int()
                .min(1)
                .max(25)
                .optional()
                .default(10)
                .describe('Maximum number of results (1-25)'),
        }),
    }, async (args) => {
        try {
            if (args.spaceId) {
                const ability = await deps.spaceAbility.createForUser(user, args.spaceId);
                if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
                    return (0, types_1.mcpError)('You do not have permission to search in this space');
                }
            }
            let AttachmentEeModule;
            try {
                AttachmentEeModule = require('../../attachments-ee/attachment-ee.service');
                const attachmentEeService = deps.moduleRef.get(AttachmentEeModule.AttachmentEeService, { strict: false });
                const results = await attachmentEeService.searchAttachment(args.query, {
                    query: args.query,
                    spaceId: args.spaceId,
                    limit: args.limit,
                }, { userId: user.id, workspaceId: workspace.id });
                return (0, types_1.mcpResult)(results);
            }
            catch {
                return (0, types_1.mcpError)('Attachment search module is not available');
            }
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
//# sourceMappingURL=attachment.tools.js.map