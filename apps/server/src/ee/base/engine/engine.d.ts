import { SelectQueryBuilder } from 'kysely';
import { DB } from '@docmost/db/types/db';
import { BaseRow } from "../../../database/types/entity.types";
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { CursorPaginationResult } from "../../../database/pagination/cursor-pagination";
import { FilterNode, SortSpec } from './schema.zod';
import { PropertySchema } from './predicate';
export type EngineListOpts = {
    filter?: FilterNode;
    sorts?: SortSpec[];
    schema: PropertySchema;
    pagination: PaginationOptions;
};
export declare function runListQuery(base: SelectQueryBuilder<DB, 'baseRows', any>, opts: EngineListOpts): Promise<CursorPaginationResult<BaseRow>>;
