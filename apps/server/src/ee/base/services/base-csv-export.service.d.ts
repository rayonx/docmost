import { KyselyDB } from "../../../database/types/kysely.types";
import { BaseRepo } from "../repos/base.repo";
import { BasePropertyRepo } from "../repos/base-property.repo";
import { BaseRowRepo } from "../repos/base-row.repo";
import { FastifyReply } from 'fastify';
import { BasePageResolverService } from './base-page-resolver.service';
export declare class BaseCsvExportService {
    private readonly db;
    private readonly baseRepo;
    private readonly basePropertyRepo;
    private readonly baseRowRepo;
    private readonly basePageResolverService;
    private readonly logger;
    constructor(db: KyselyDB, baseRepo: BaseRepo, basePropertyRepo: BasePropertyRepo, baseRowRepo: BaseRowRepo, basePageResolverService: BasePageResolverService);
    streamBaseAsCsv(pageId: string, workspaceId: string, userId: string, reply: FastifyReply): Promise<void>;
    private buildCtx;
}
