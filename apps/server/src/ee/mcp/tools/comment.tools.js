"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommentTools = registerCommentTools;
const v4_1 = require("zod/v4");
const common_1 = require("@nestjs/common");
const types_1 = require("./types");
function registerCommentTools({ server, user, workspace }, deps) {
    server.registerTool('get_comments', {
        title: 'Get Comments',
        description: 'Get comments for a page with pagination support.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().uuid().describe('Page ID'),
            limit: v4_1.z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .default(20)
                .describe('Maximum number of comments (1-100)'),
            cursor: v4_1.z.string().optional().describe('Pagination cursor'),
        }),
    }, async (args) => {
        try {
            const page = await deps.pageRepo.findById(args.pageId);
            if (!(0, types_1.validatePageInWorkspace)(page, workspace.id)) {
                return (0, types_1.mcpError)('Page not found');
            }
            try {
                await deps.pageAccessService.validateCanView(page, user);
            }
            catch (e) {
                if (e instanceof common_1.ForbiddenException) {
                    return (0, types_1.mcpError)('You do not have permission to view comments on this page');
                }
                throw e;
            }
            const result = await deps.commentService.findByPageId(page.id, {
                limit: args.limit,
                cursor: args.cursor,
            });
            return (0, types_1.mcpResult)(result);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
    server.registerTool('create_comment', {
        title: 'Create Comment',
        description: 'Create a comment on a page. Can also create replies to existing comments by providing parentCommentId.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().uuid().describe('Page ID to comment on'),
            content: v4_1.z
                .string()
                .describe('Comment content as JSON string (ProseMirror format)'),
            selection: v4_1.z
                .string()
                .max(250)
                .optional()
                .describe('Selected text the comment refers to (max 250 chars)'),
            parentCommentId: v4_1.z
                .string()
                .uuid()
                .optional()
                .describe('Parent comment ID if this is a reply'),
        }),
    }, async (args) => {
        try {
            const page = await deps.pageRepo.findById(args.pageId);
            if (!(0, types_1.validatePageInWorkspace)(page, workspace.id)) {
                return (0, types_1.mcpError)('Page not found');
            }
            try {
                await deps.pageAccessService.validateCanEdit(page, user);
            }
            catch (e) {
                if (e instanceof common_1.ForbiddenException) {
                    return (0, types_1.mcpError)('You do not have permission to create comments on this page');
                }
                throw e;
            }
            const comment = await deps.commentService.create({ page, workspaceId: workspace.id, user }, {
                pageId: args.pageId,
                content: args.content,
                type: "page",
                selection: args.selection,
                parentCommentId: args.parentCommentId,
            });
            return (0, types_1.mcpResult)(comment);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
    server.registerTool('update_comment', {
        title: 'Update Comment',
        description: 'Update an existing comment. Only the comment creator can edit their own comments.',
        inputSchema: v4_1.z.object({
            commentId: v4_1.z.string().uuid().describe('Comment ID to update'),
            content: v4_1.z
                .string()
                .describe('Updated comment content as JSON string (ProseMirror format)'),
        }),
    }, async (args) => {
        try {
            const comment = await deps.commentService.findById(args.commentId);
            if (comment.workspaceId !== workspace.id) {
                return (0, types_1.mcpError)('Comment not found');
            }
            const page = await deps.pageRepo.findById(comment.pageId);
            if (!(0, types_1.validatePageInWorkspace)(page, workspace.id)) {
                return (0, types_1.mcpError)('Page not found');
            }
            try {
                await deps.pageAccessService.validateCanEdit(page, user);
            }
            catch (e) {
                if (e instanceof common_1.ForbiddenException) {
                    return (0, types_1.mcpError)('You do not have permission to edit comments on this page');
                }
                throw e;
            }
            const updated = await deps.commentService.update(comment, { commentId: args.commentId, content: args.content }, user);
            return (0, types_1.mcpResult)(updated);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
//# sourceMappingURL=comment.tools.js.map