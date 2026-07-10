import { KyselyDB } from "../../../database/types/kysely.types";
import type { ReferenceResolutionContext } from './reference-source';
export declare function loadReferenceMaps(db: KyselyDB, ids: {
    userIds?: Set<string>;
    pageIds?: Set<string>;
    attachmentIds?: Set<string>;
}, workspaceId: string): Promise<ReferenceResolutionContext>;
