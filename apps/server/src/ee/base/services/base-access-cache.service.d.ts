import { Page, User } from "../../../database/types/entity.types";
import { PageAccessService } from '../../../core/page/page-access/page-access.service';
export declare class BaseAccessCacheService {
    private readonly pageAccessService;
    private readonly cache;
    private static readonly TTL_MS;
    private maxEntries;
    constructor(pageAccessService: PageAccessService);
    validateCanEdit(page: Page, user: User): Promise<void>;
    validateCanView(page: Page, user: User): Promise<void>;
    private validate;
}
