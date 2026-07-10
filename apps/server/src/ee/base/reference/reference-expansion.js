"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectReferenceIds = collectReferenceIds;
exports.loadUserRefs = loadUserRefs;
exports.buildRowReferences = buildRowReferences;
const property_type_registry_1 = require("../property-types/property-type.registry");
const reference_source_1 = require("./reference-source");
function collectReferenceIds(rows, properties) {
    const userIds = new Set();
    const pageIds = new Set();
    const refProps = properties
        .map((p) => ({ p, kind: (0, property_type_registry_1.getDescriptor)(p.type)?.referenceKind }))
        .filter((x) => x.kind === 'person' || x.kind === 'page');
    for (const row of rows) {
        if (row.lastUpdatedById)
            userIds.add(row.lastUpdatedById);
        if (row.creatorId)
            userIds.add(row.creatorId);
        const cells = row.cells ?? {};
        for (const { p, kind } of refProps) {
            const ids = (0, reference_source_1.referenceSource)(kind).extractIds(cells[p.id]);
            const target = kind === 'person' ? userIds : pageIds;
            for (const id of ids)
                target.add(id);
        }
    }
    return { userIds, pageIds };
}
async function loadUserRefs(db, userIds, workspaceId) {
    if (userIds.size === 0)
        return {};
    const rows = await db
        .selectFrom('users')
        .select(['id', 'name', 'avatarUrl'])
        .where('id', 'in', Array.from(userIds))
        .where('workspaceId', '=', workspaceId)
        .execute();
    const out = {};
    for (const u of rows)
        out[u.id] = { id: u.id, name: u.name, avatarUrl: u.avatarUrl };
    return out;
}
async function buildRowReferences(args) {
    const { userIds, pageIds } = collectReferenceIds(args.rows, args.properties);
    const [users, pageList] = await Promise.all([
        loadUserRefs(args.db, userIds, args.workspaceId),
        pageIds.size === 0
            ? Promise.resolve([])
            : args.resolvePages(Array.from(pageIds), args.workspaceId, args.userId),
    ]);
    const pages = {};
    for (const p of pageList)
        pages[p.id] = p;
    return { users, pages };
}
//# sourceMappingURL=reference-expansion.js.map