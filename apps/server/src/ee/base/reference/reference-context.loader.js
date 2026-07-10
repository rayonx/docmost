"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadReferenceMaps = loadReferenceMaps;
async function loadReferenceMaps(db, ids, workspaceId) {
    const ctx = {};
    if (ids.userIds && ids.userIds.size > 0) {
        const rows = await db
            .selectFrom('users')
            .select(['id', 'name', 'email'])
            .where('id', 'in', Array.from(ids.userIds))
            .where('workspaceId', '=', workspaceId)
            .execute();
        ctx.userNames = new Map(rows.map((u) => [u.id, u.name || u.email || '']));
    }
    if (ids.pageIds && ids.pageIds.size > 0) {
        const rows = await db
            .selectFrom('pages')
            .select(['id', 'title'])
            .where('id', 'in', Array.from(ids.pageIds))
            .where('workspaceId', '=', workspaceId)
            .execute();
        ctx.pageTitles = new Map(rows.map((p) => [p.id, p.title ?? '']));
    }
    if (ids.attachmentIds && ids.attachmentIds.size > 0) {
        const rows = await db
            .selectFrom('attachments')
            .select(['id', 'fileName'])
            .where('id', 'in', Array.from(ids.attachmentIds))
            .where('workspaceId', '=', workspaceId)
            .execute();
        ctx.attachmentNames = new Map(rows.map((a) => [a.id, a.fileName]));
    }
    return ctx;
}
//# sourceMappingURL=reference-context.loader.js.map