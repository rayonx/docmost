"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runListQuery = runListQuery;
const cursor_pagination_1 = require("../../../database/pagination/cursor-pagination");
const predicate_1 = require("./predicate");
const sort_1 = require("./sort");
const cursor_1 = require("./cursor");
async function runListQuery(base, opts) {
    let qb = base;
    if (opts.filter) {
        const filter = opts.filter;
        qb = qb.where((eb) => (0, predicate_1.buildWhere)(eb, filter, opts.schema));
    }
    const sortBuilds = opts.sorts && opts.sorts.length > 0
        ? (0, sort_1.buildSorts)(opts.sorts, opts.schema)
        : [];
    for (const sb of sortBuilds) {
        qb = qb.select(sb.expression.as(sb.key));
    }
    const cursor = (0, cursor_1.makeCursor)(sortBuilds, sort_1.CURSOR_TAIL_KEYS);
    const fields = [
        ...sortBuilds.map((sb) => ({
            expression: sb.expression,
            direction: sb.direction,
            key: sb.key,
        })),
        {
            expression: 'position',
            direction: 'asc',
            key: 'position',
        },
        {
            expression: 'id',
            direction: 'asc',
            key: 'id',
        },
    ];
    const result = (await (0, cursor_pagination_1.executeWithCursorPagination)(qb, {
        perPage: opts.pagination.limit,
        cursor: opts.pagination.cursor,
        beforeCursor: opts.pagination.beforeCursor,
        fields: fields,
        encodeCursor: cursor.encodeCursor,
        decodeCursor: cursor.decodeCursor,
        parseCursor: cursor.parseCursor,
    }));
    for (const item of result.items) {
        for (const sb of sortBuilds)
            delete item[sb.key];
    }
    return result;
}
//# sourceMappingURL=engine.js.map