import { FastifyReply } from 'fastify';
import { DocxExportService } from './docx-export.service';
import { ExportDocxDto } from './dto/docx-export.dto';
import { User } from "../../database/types/entity.types";
import { PageRepo } from "../../database/repos/page/page.repo";
import { PageAccessService } from '../../core/page/page-access/page-access.service';
import { IAuditService } from '../../integrations/audit/audit.service';
export declare class DocxExportController {
    private readonly docxExportService;
    private readonly pageRepo;
    private readonly pageAccessService;
    private readonly auditService;
    constructor(docxExportService: DocxExportService, pageRepo: PageRepo, pageAccessService: PageAccessService, auditService: IAuditService);
    exportPageAsDocx(dto: ExportDocxDto, user: User, res: FastifyReply): Promise<void>;
}
