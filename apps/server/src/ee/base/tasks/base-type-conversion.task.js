"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConversionStillPending = isConversionStillPending;
exports.processBaseTypeConversion = processBaseTypeConversion;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../../database/utils");
const base_schemas_1 = require("../base.schemas");
const reference_context_loader_1 = require("../reference/reference-context.loader");
async function isConversionStillPending(basePropertyRepo, data, trx) {
    const property = await basePropertyRepo.findById(data.pageId, data.propertyId, { trx });
    return (!!property &&
        property.pendingType === data.toType &&
        property.pendingToken === data.pendingToken);
}
const logger = new common_1.Logger('BaseTypeConversionTask');
const CHUNK_SIZE = 1000;
async function processBaseTypeConversion(db, baseRowRepo, data, opts) {
    const { pageId, propertyId, workspaceId, fromType, toType, fromTypeOptions, toTypeOptions, clearMode, actorId, } = data;
    const progress = opts?.progress;
    const trx = opts?.trx;
    const queryDb = (0, utils_1.dbOrTx)(db, trx);
    let total = 0;
    let converted = 0;
    let cleared = 0;
    let alreadyConverted = 0;
    for await (const chunk of baseRowRepo.streamByPageId(pageId, {
        workspaceId,
        chunkSize: CHUNK_SIZE,
        trx,
        withCellKey: propertyId,
    })) {
        const ctx = await buildCtx(queryDb, chunk, propertyId, fromType, fromTypeOptions, toTypeOptions, workspaceId);
        const updates = [];
        for (const row of chunk) {
            const cells = (row.cells ?? {});
            if (!(propertyId in cells))
                continue;
            total++;
            if (!clearMode &&
                (0, base_schemas_1.isAlreadyConvertedCell)(fromType, toType, cells[propertyId])) {
                alreadyConverted++;
                continue;
            }
            if (clearMode) {
                updates.push({ id: row.id, patch: { [propertyId]: null } });
                cleared++;
                continue;
            }
            const result = (0, base_schemas_1.attemptCellConversion)(fromType, toType, cells[propertyId], ctx);
            if (result.converted) {
                converted++;
                updates.push({
                    id: row.id,
                    patch: { [propertyId]: result.value ?? null },
                });
            }
            else {
                cleared++;
                updates.push({ id: row.id, patch: { [propertyId]: null } });
            }
        }
        if (updates.length > 0) {
            await baseRowRepo.batchUpdateCells(updates, {
                pageId,
                workspaceId,
                actorId,
                trx,
            });
        }
        if (progress)
            await progress(total);
    }
    logger.debug(`type-conversion ${fromType}→${toType} base=${pageId} prop=${propertyId} total=${total} converted=${converted} cleared=${cleared} already=${alreadyConverted}`);
    return { converted, cleared, total, alreadyConverted };
}
async function buildCtx(db, chunk, propertyId, fromType, fromTypeOptions, toTypeOptions, workspaceId) {
    const ids = {};
    if (fromType === base_schemas_1.BasePropertyType.PERSON) {
        ids.userIds = collectIds(chunk, propertyId);
    }
    else if (fromType === base_schemas_1.BasePropertyType.FILE) {
        ids.attachmentIds = collectFileIds(chunk, propertyId);
    }
    else if (fromType === base_schemas_1.BasePropertyType.PAGE) {
        ids.pageIds = collectIds(chunk, propertyId);
    }
    const maps = await (0, reference_context_loader_1.loadReferenceMaps)(db, ids, workspaceId);
    return { ...maps, fromTypeOptions, toTypeOptions };
}
function collectIds(chunk, propertyId) {
    const out = new Set();
    for (const row of chunk) {
        const v = row.cells?.[propertyId];
        if (v == null)
            continue;
        if (Array.isArray(v)) {
            for (const item of v) {
                if (typeof item === 'string' && item.length > 0)
                    out.add(item);
            }
        }
        else if (typeof v === 'string' && v.length > 0) {
            out.add(v);
        }
    }
    return out;
}
function collectFileIds(chunk, propertyId) {
    const out = new Set();
    for (const row of chunk) {
        const v = row.cells?.[propertyId];
        if (!Array.isArray(v))
            continue;
        for (const f of v) {
            if (typeof f === 'string' && f.length > 0) {
                out.add(f);
            }
            else if (f && typeof f === 'object' && typeof f.id === 'string') {
                out.add(f.id);
            }
        }
    }
    return out;
}
//# sourceMappingURL=base-type-conversion.task.js.map