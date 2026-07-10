import { LicenseService } from "./license.service";
import { User, Workspace } from "../../database/types/entity.types";
import WorkspaceAbilityFactory from '../../core/casl/abilities/workspace-ability.factory';
import { ActivateLicenseDto } from "./dto/license.dto";
import { LicenseInfo } from "./license.interface";
import { IAuditService } from '../../integrations/audit/audit.service';
import { Cache } from 'cache-manager';
export declare class LicenseController {
    private readonly licenseService;
    private readonly workspaceAbility;
    private readonly auditService;
    private readonly cacheManager;
    constructor(licenseService: LicenseService, workspaceAbility: WorkspaceAbilityFactory, auditService: IAuditService, cacheManager: Cache);
    getLicense(workspace: Workspace): Promise<LicenseInfo>;
    activateLicense(user: User, workspace: Workspace, dto: ActivateLicenseDto): Promise<LicenseInfo>;
    removeLicense(user: User, workspace: Workspace): Promise<void>;
    validateAccess(user: User, workspace: Workspace): Promise<void>;
}
