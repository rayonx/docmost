import { PdfExportService } from './pdf-export.service';
import { ExportPdfDto, ExportPdfStatusDto } from './dto/pdf-export.dto';
import { User } from "../../database/types/entity.types";
import { PageRepo } from "../../database/repos/page/page.repo";
import { PageAccessService } from '../../core/page/page-access/page-access.service';
import { FastifyReply } from 'fastify';
import { TokenService } from '../../core/auth/services/token.service';
import { KyselyDB } from "../../database/types/kysely.types";
import { StorageService } from '../../integrations/storage/storage.service';
import SpaceAbilityFactory from '../../core/casl/abilities/space-ability.factory';
export declare class PdfExportController {
    private readonly pdfExportService;
    private readonly pageRepo;
    private readonly pageAccessService;
    private readonly tokenService;
    private readonly storageService;
    private readonly spaceAbility;
    private readonly db;
    constructor(pdfExportService: PdfExportService, pageRepo: PageRepo, pageAccessService: PageAccessService, tokenService: TokenService, storageService: StorageService, spaceAbility: SpaceAbilityFactory, db: KyselyDB);
    exportPageAsPdf(dto: ExportPdfDto, user: User): Promise<{
        fileTaskId: string;
    }>;
    getExportStatus(dto: ExportPdfStatusDto, user: User): Promise<{
        fileTaskId: string;
        status: string;
        fileName: string;
        fileSize: string;
        exportUrl: string;
        errorMessage: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    downloadExport(fileTaskId: string, token: string, res: FastifyReply): Promise<void>;
    getPdfRenderData(body: {
        pageId: string;
        token: string;
    }): Promise<{
        pageId: string;
        title: string;
        content: any;
    }>;
    private prepareContentWithPublicAttachments;
}
