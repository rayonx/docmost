"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPageTools = registerPageTools;
const v4_1 = require("zod/v4");
const space_ability_type_1 = require("../../../core/casl/interfaces/space-ability.type");
const common_1 = require("@nestjs/common");
const collaboration_util_1 = require("../../../collaboration/collaboration.util");
const types_1 = require("./types");
function registerPageTools(ctx, deps) {
    registerSearchPages(ctx, deps);
    registerGetPage(ctx, deps);
    registerCreatePage(ctx, deps);
    registerUpdatePage(ctx, deps);
    registerListPages(ctx, deps);
    registerListChildPages(ctx, deps);
    registerDuplicatePage(ctx, deps);
    registerCopyPageToSpace(ctx, deps);
    registerMovePage(ctx, deps);
    registerMovePageToSpace(ctx, deps);
}
function formatPageContent(page, format) {
    if (format === 'json' || !page.content)
        return page;
    const contentOutput = format === 'markdown'
        ? (0, collaboration_util_1.jsonToMarkdown)(page.content)
        : (0, collaboration_util_1.jsonToHtml)(page.content);
    return { ...page, content: contentOutput };
}
function registerSearchPages({ server, user, workspace }, deps) {
    server.registerTool('search_pages', {
        title: 'Search Pages',
        description: 'Full-text search across all pages the user has access to. Returns matching pages with highlighted snippets.',
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
            offset: v4_1.z
                .number()
                .int()
                .min(0)
                .optional()
                .default(0)
                .describe('Offset for pagination'),
        }),
    }, async (args) => {
        try {
            if (args.spaceId) {
                const ability = await deps.spaceAbility.createForUser(user, args.spaceId);
                if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
                    return (0, types_1.mcpError)('You do not have permission to search in this space');
                }
            }
            const searchParams = {
                query: args.query,
                spaceId: args.spaceId,
                limit: args.limit,
                offset: args.offset,
            };
            let results;
            if (deps.environmentService.getSearchDriver() === 'typesense') {
                results = await searchTypesense(deps, searchParams, {
                    userId: user.id,
                    workspaceId: workspace.id,
                });
            }
            else {
                results = await deps.searchService.searchPage(searchParams, {
                    userId: user.id,
                    workspaceId: workspace.id,
                });
            }
            return (0, types_1.mcpResult)(results);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerGetPage({ server, user, workspace }, deps) {
    server.registerTool('get_page', {
        title: 'Get Page',
        description: 'Get a page by ID, including its content. Returns page metadata and content in the requested format.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().describe('Page ID (UUID or slug)'),
            format: v4_1.z
                .enum(['markdown', 'html', 'json'])
                .optional()
                .default('markdown')
                .describe('Content format (default: markdown)'),
        }),
    }, async (args) => {
        try {
            const page = await deps.pageRepo.findById(args.pageId, {
                includeSpace: true,
                includeContent: true,
                includeCreator: true,
                includeLastUpdatedBy: true,
            });
            if (!(0, types_1.validatePageInWorkspace)(page, workspace.id)) {
                return (0, types_1.mcpError)('Page not found');
            }
            try {
                await deps.pageAccessService.validateCanView(page, user);
            }
            catch (e) {
                if (e instanceof common_1.ForbiddenException) {
                    return (0, types_1.mcpError)('You do not have permission to view this page');
                }
                throw e;
            }
            return (0, types_1.mcpResult)(formatPageContent(page, args.format));
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerCreatePage({ server, user, workspace }, deps) {
    server.registerTool('create_page', {
        title: 'Create Page',
        description: 'Create a new page in a space. Content can be provided in markdown, HTML, or JSON format.',
        inputSchema: v4_1.z.object({
            title: v4_1.z.string().optional().describe('Page title'),
            spaceId: v4_1.z
                .string()
                .uuid()
                .describe('Space ID where the page will be created'),
            content: v4_1.z.string().optional().describe('Page content'),
            parentPageId: v4_1.z
                .string()
                .uuid()
                .optional()
                .describe('Parent page ID for nested pages'),
            format: v4_1.z
                .enum(['markdown', 'html', 'json'])
                .optional()
                .default('markdown')
                .describe('Content format (default: markdown)'),
        }),
    }, async (args) => {
        try {
            if (args.parentPageId) {
                const parentPage = await deps.pageRepo.findById(args.parentPageId);
                if (!(0, types_1.validatePageInWorkspace)(parentPage, workspace.id) ||
                    parentPage.spaceId !== args.spaceId) {
                    return (0, types_1.mcpError)('Parent page not found');
                }
                try {
                    await deps.pageAccessService.validateCanEdit(parentPage, user);
                }
                catch (e) {
                    if (e instanceof common_1.ForbiddenException) {
                        return (0, types_1.mcpError)('You do not have permission to create pages under this parent');
                    }
                    throw e;
                }
            }
            else {
                const ability = await deps.spaceAbility.createForUser(user, args.spaceId);
                if (ability.cannot(space_ability_type_1.SpaceCaslAction.Create, space_ability_type_1.SpaceCaslSubject.Page)) {
                    return (0, types_1.mcpError)('You do not have permission to create pages in this space');
                }
            }
            const page = await deps.pageService.create(user.id, workspace.id, {
                title: args.title,
                spaceId: args.spaceId,
                content: args.content,
                parentPageId: args.parentPageId,
                format: args.format,
            });
            return (0, types_1.mcpResult)(formatPageContent(page, args.format));
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerUpdatePage({ server, user, workspace }, deps) {
    server.registerTool('update_page', {
        title: 'Update Page',
        description: 'Update a page title and/or content. Content can be provided in markdown, HTML, or JSON format. Use the operation parameter to control how content is applied: append (default), prepend, or replace.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().uuid().describe('Page ID to update'),
            title: v4_1.z.string().optional().describe('New page title'),
            content: v4_1.z.string().optional().describe('New page content'),
            operation: v4_1.z
                .enum(['replace', 'append', 'prepend'])
                .optional()
                .default('append')
                .describe('How to apply content: append to end (default), prepend to beginning, or replace entirely. Only used when content is provided.'),
            format: v4_1.z
                .enum(['markdown', 'html', 'json'])
                .optional()
                .default('markdown')
                .describe('Content format (default: markdown)'),
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
                    return (0, types_1.mcpError)('You do not have permission to edit this page');
                }
                throw e;
            }
            const updatedPage = await deps.pageService.update(page, {
                pageId: args.pageId,
                title: args.title,
                content: args.content,
                operation: args.content ? args.operation : undefined,
                format: args.format,
            }, user);
            return (0, types_1.mcpResult)(formatPageContent(updatedPage, args.format));
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerListPages({ server, user, workspace }, deps) {
    server.registerTool('list_pages', {
        title: 'List Pages',
        description: 'List pages ordered by recently updated. Optionally filter by spaceId. Returns a paginated flat list of all pages (not just root pages). Supports cursor-based pagination.',
        inputSchema: v4_1.z.object({
            spaceId: v4_1.z
                .string()
                .uuid()
                .optional()
                .describe('Filter to a specific space'),
            cursor: v4_1.z.string().optional().describe('Pagination cursor'),
            limit: v4_1.z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .describe('Number of pages per page (default: 50)'),
        }),
    }, async (args) => {
        try {
            if (args.spaceId) {
                const ability = await deps.spaceAbility.createForUser(user, args.spaceId);
                if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
                    return (0, types_1.mcpError)('You do not have permission to list pages in this space');
                }
                const result = await deps.pageService.getRecentSpacePages(args.spaceId, user.id, {
                    cursor: args.cursor,
                    limit: args.limit,
                });
                return (0, types_1.mcpResult)(result);
            }
            const result = await deps.pageService.getRecentPages(user.id, {
                cursor: args.cursor,
                limit: args.limit,
            });
            return (0, types_1.mcpResult)(result);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerListChildPages({ server, user, workspace }, deps) {
    server.registerTool('list_child_pages', {
        title: 'List Child Pages',
        description: 'List child pages in the page tree. Pass spaceId to list root-level pages, or pageId to list children of a specific page. Supports cursor-based pagination.',
        inputSchema: v4_1.z.object({
            spaceId: v4_1.z
                .string()
                .uuid()
                .optional()
                .describe('Space ID to list root pages from'),
            pageId: v4_1.z
                .string()
                .uuid()
                .optional()
                .describe('Parent page ID to list children of'),
            cursor: v4_1.z.string().optional().describe('Pagination cursor'),
        }),
    }, async (args) => {
        try {
            if (!args.spaceId && !args.pageId) {
                return (0, types_1.mcpError)('Either spaceId or pageId must be provided');
            }
            let spaceId = args.spaceId;
            if (args.pageId) {
                const page = await deps.pageRepo.findById(args.pageId);
                if (!(0, types_1.validatePageInWorkspace)(page, workspace.id)) {
                    return (0, types_1.mcpError)('Page not found');
                }
                spaceId = page.spaceId;
            }
            const ability = await deps.spaceAbility.createForUser(user, spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Read, space_ability_type_1.SpaceCaslSubject.Page)) {
                return (0, types_1.mcpError)('You do not have permission to list pages in this space');
            }
            const spaceCanEdit = ability.can(space_ability_type_1.SpaceCaslAction.Edit, space_ability_type_1.SpaceCaslSubject.Page);
            const result = await deps.pageService.getSidebarPages(spaceId, { cursor: args.cursor }, args.pageId, user.id, spaceCanEdit);
            return (0, types_1.mcpResult)(result);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerDuplicatePage({ server, user, workspace }, deps) {
    server.registerTool('duplicate_page', {
        title: 'Duplicate Page',
        description: 'Duplicate a page. Optionally specify a target space for cross-space duplication.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().uuid().describe('Page ID to duplicate'),
            spaceId: v4_1.z
                .string()
                .uuid()
                .optional()
                .describe('Target space ID for cross-space duplication'),
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
                    return (0, types_1.mcpError)('You do not have permission to view this page');
                }
                throw e;
            }
            if (args.spaceId) {
                const abilities = await Promise.all([
                    deps.spaceAbility.createForUser(user, page.spaceId),
                    deps.spaceAbility.createForUser(user, args.spaceId),
                ]);
                if (abilities.some((ability) => ability.cannot(space_ability_type_1.SpaceCaslAction.Edit, space_ability_type_1.SpaceCaslSubject.Page))) {
                    return (0, types_1.mcpError)('You do not have permission to duplicate to this space');
                }
                const duplicated = await deps.pageService.duplicatePage(page, args.spaceId, user);
                return (0, types_1.mcpResult)(duplicated);
            }
            const ability = await deps.spaceAbility.createForUser(user, page.spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Edit, space_ability_type_1.SpaceCaslSubject.Page)) {
                return (0, types_1.mcpError)('You do not have permission to duplicate this page');
            }
            const duplicated = await deps.pageService.duplicatePage(page, undefined, user);
            return (0, types_1.mcpResult)(duplicated);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerCopyPageToSpace({ server, user, workspace }, deps) {
    server.registerTool('copy_page_to_space', {
        title: 'Copy Page to Space',
        description: 'Copy a page and its children to a different space. The original page remains in its current space.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().uuid().describe('Page ID to copy'),
            spaceId: v4_1.z
                .string()
                .uuid()
                .describe('Target space ID to copy the page to'),
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
                    return (0, types_1.mcpError)('You do not have permission to view this page');
                }
                throw e;
            }
            const abilities = await Promise.all([
                deps.spaceAbility.createForUser(user, page.spaceId),
                deps.spaceAbility.createForUser(user, args.spaceId),
            ]);
            if (abilities.some((ability) => ability.cannot(space_ability_type_1.SpaceCaslAction.Edit, space_ability_type_1.SpaceCaslSubject.Page))) {
                return (0, types_1.mcpError)('You do not have permission to copy pages between these spaces');
            }
            const copied = await deps.pageService.duplicatePage(page, args.spaceId, user);
            return (0, types_1.mcpResult)(copied);
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerMovePage({ server, user, workspace }, deps) {
    server.registerTool('move_page', {
        title: 'Move Page',
        description: 'Move a page within the same space. Use parentPageId to nest it under another page, or omit to make it a root page.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().uuid().describe('Page ID to move'),
            parentPageId: v4_1.z
                .string()
                .uuid()
                .nullable()
                .optional()
                .describe('Parent page ID to nest under. Omit or null to make a root page.'),
            position: v4_1.z
                .string()
                .min(5)
                .max(12)
                .optional()
                .describe('Fractional index position string (5-12 chars). If omitted, the page is moved to the end.'),
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
                    return (0, types_1.mcpError)('You do not have permission to move this page');
                }
                throw e;
            }
            const parentPageId = args.parentPageId ?? null;
            if (parentPageId && parentPageId !== page.parentPageId) {
                const parentPage = await deps.pageRepo.findById(parentPageId);
                if (!(0, types_1.validatePageInWorkspace)(parentPage, workspace.id) ||
                    parentPage.spaceId !== page.spaceId) {
                    return (0, types_1.mcpError)('Parent page not found in the same space');
                }
                try {
                    await deps.pageAccessService.validateCanEdit(parentPage, user);
                }
                catch (e) {
                    if (e instanceof common_1.ForbiddenException) {
                        return (0, types_1.mcpError)('You do not have permission to move pages under this parent');
                    }
                    throw e;
                }
            }
            const position = args.position ??
                (await deps.pageService.nextPagePosition(page.spaceId, parentPageId));
            await deps.pageService.movePage({ pageId: args.pageId, position, parentPageId }, page);
            return (0, types_1.mcpResult)({
                message: `Page "${page.title}" moved successfully`,
            });
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
function registerMovePageToSpace({ server, user, workspace }, deps) {
    server.registerTool('move_page_to_space', {
        title: 'Move Page to Space',
        description: 'Move a page and its children to a different space. The page becomes a root page in the target space.',
        inputSchema: v4_1.z.object({
            pageId: v4_1.z.string().uuid().describe('Page ID to move'),
            spaceId: v4_1.z
                .string()
                .uuid()
                .describe('Target space ID to move the page to'),
        }),
    }, async (args) => {
        try {
            const page = await deps.pageRepo.findById(args.pageId);
            if (!(0, types_1.validatePageInWorkspace)(page, workspace.id)) {
                return (0, types_1.mcpError)('Page not found');
            }
            if (page.spaceId === args.spaceId) {
                return (0, types_1.mcpError)('Page is already in this space');
            }
            const abilities = await Promise.all([
                deps.spaceAbility.createForUser(user, page.spaceId),
                deps.spaceAbility.createForUser(user, args.spaceId),
            ]);
            if (abilities.some((ability) => ability.cannot(space_ability_type_1.SpaceCaslAction.Edit, space_ability_type_1.SpaceCaslSubject.Page))) {
                return (0, types_1.mcpError)('You do not have permission to move pages between these spaces');
            }
            try {
                await deps.pageAccessService.validateCanEdit(page, user);
            }
            catch (e) {
                if (e instanceof common_1.ForbiddenException) {
                    return (0, types_1.mcpError)('You do not have permission to move this page');
                }
                throw e;
            }
            await deps.pageService.movePageToSpace(page, args.spaceId, user.id);
            return (0, types_1.mcpResult)({
                message: `Page "${page.title}" moved to space ${args.spaceId}`,
            });
        }
        catch (error) {
            return (0, types_1.mcpError)(error.message);
        }
    });
}
async function searchTypesense(deps, searchParams, opts) {
    let TypesenseModule;
    try {
        TypesenseModule = require('../../typesense/services/page-search.service');
        const PageSearchService = deps.moduleRef.get(TypesenseModule.PageSearchService, { strict: false });
        return PageSearchService.searchPage(searchParams, opts);
    }
    catch {
    }
    return deps.searchService.searchPage(searchParams, opts);
}
//# sourceMappingURL=page.tools.js.map