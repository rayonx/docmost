"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBaseFormulaRecompute = processBaseFormulaRecompute;
const common_1 = require("@nestjs/common");
const server_1 = require("@docmost/base-formula/server");
const logger = new common_1.Logger("BaseFormulaRecomputeTask");
const CHUNK_SIZE = 500;
async function processBaseFormulaRecompute(db, baseRowRepo, basePropertyRepo, data, opts) {
    const { pageId, workspaceId, propertyIds, rowIds } = data;
    const properties = await basePropertyRepo.findByPageId(pageId);
    const targets = properties.filter((p) => p.type === "formula" && propertyIds.includes(p.id));
    if (targets.length === 0)
        return { processed: 0, errored: 0 };
    const graph = new server_1.BaseFormulaGraph(properties);
    const evalOrder = graph.evalOrder().filter((id) => targets.some((t) => t.id === id));
    const propertyLookup = new Map(properties.map((p) => [p.id, { id: p.id, type: p.type, typeOptions: p.typeOptions }]));
    let processed = 0;
    let errored = 0;
    const sourceChunks = async function* () {
        if (rowIds && rowIds.length > 0) {
            for (let i = 0; i < rowIds.length; i += CHUNK_SIZE) {
                const rows = await baseRowRepo.findByIds(rowIds.slice(i, i + CHUNK_SIZE), { workspaceId, trx: opts?.trx });
                yield rows.filter((r) => r.pageId === pageId);
            }
            return;
        }
        yield* baseRowRepo.streamByPageId(pageId, {
            workspaceId,
            chunkSize: CHUNK_SIZE,
            trx: opts?.trx,
        });
    };
    for await (const chunk of sourceChunks()) {
        const updates = [];
        for (const row of chunk) {
            const cells = (row.cells ?? {});
            const ctx = {
                registry: server_1.registry,
                properties: propertyLookup,
                depth: 0,
                maxDepth: server_1.DEFAULT_MAX_DEPTH,
                memo: new Map(),
            };
            const patch = {};
            let rowErrored = false;
            for (const propId of evalOrder) {
                const prop = propertyLookup.get(propId);
                if (!prop || prop.type !== "formula")
                    continue;
                const ast = prop.typeOptions.ast;
                try {
                    const result = (0, server_1.evaluate)(ast, { ...cells, ...patch }, ctx);
                    patch[propId] = typeof result === "number" ? (0, server_1.snapNumber)(result) : result;
                }
                catch (e) {
                    patch[propId] = (0, server_1.makeErrorCell)("TYPE_MISMATCH", e.message);
                    rowErrored = true;
                }
                if (typeof patch[propId] === "object" && patch[propId] !== null && "__err" in patch[propId]) {
                    rowErrored = true;
                }
            }
            if (Object.keys(patch).length > 0) {
                updates.push({ id: row.id, patch });
            }
            processed++;
            if (rowErrored)
                errored++;
        }
        if (updates.length > 0) {
            await baseRowRepo.batchUpdateCells(updates, {
                pageId,
                workspaceId,
                actorId: undefined,
                trx: opts?.trx,
            });
            await opts?.onBatch?.(updates);
        }
        await opts?.progress?.(processed);
    }
    logger.debug(`formula-recompute base=${pageId} props=${propertyIds.join(",")} processed=${processed} errored=${errored}`);
    return { processed, errored };
}
//# sourceMappingURL=base-formula-recompute.task.js.map