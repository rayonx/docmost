"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBaseCellGc = processBaseCellGc;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../../database/utils");
const logger = new common_1.Logger('BaseCellGcTask');
const CHUNK_SIZE = 1000;
async function processBaseCellGc(db, baseRowRepo, basePropertyRepo, data) {
    const { pageId, propertyId, workspaceId } = data;
    let scrubbed = 0;
    for await (const chunk of baseRowRepo.streamByPageId(pageId, {
        workspaceId,
        chunkSize: CHUNK_SIZE,
        withCellKey: propertyId,
    })) {
        const rowIds = chunk.map((row) => row.id);
        await (0, utils_1.executeTx)(db, async (trx) => {
            await baseRowRepo.removeCellKeyByIds(rowIds, propertyId, {
                pageId,
                workspaceId,
                trx,
            });
        });
        scrubbed += rowIds.length;
    }
    await basePropertyRepo.hardDelete(pageId, propertyId);
    logger.debug(`cell-gc complete base=${pageId} prop=${propertyId} scrubbed=${scrubbed}`);
}
//# sourceMappingURL=base-cell-gc.task.js.map