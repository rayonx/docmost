import { MfaService } from './services/mfa.service';
import { EnableMfaDto, DisableMfaDto, RegenerateBackupCodesDto, MfaDto } from './dto/mfa.dto';
import { User, Workspace } from "../../database/types/entity.types";
import { UserRepo } from "../../database/repos/user/user.repo";
import { MfaMethod } from "./mfa.util";
import { FastifyReply, FastifyRequest } from 'fastify';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { MfaAuthService } from './services/mfa-auth.service';
import { IAuditService } from '../../integrations/audit/audit.service';
export declare class MfaController {
    private readonly mfaService;
    private readonly userRepo;
    private readonly environmentService;
    private readonly mfaAuthService;
    private readonly auditService;
    constructor(mfaService: MfaService, userRepo: UserRepo, environmentService: EnvironmentService, mfaAuthService: MfaAuthService, auditService: IAuditService);
    setupMFA(req: FastifyRequest): Promise<{
        method: MfaMethod;
        qrCode: string;
        manualKey: string;
    }>;
    enableMFA(req: FastifyRequest, res: FastifyReply, enableMfaDto: EnableMfaDto): Promise<{
        backupCodes: string[];
    }>;
    disableMFA(user: User, disableMfaDto: DisableMfaDto): Promise<void>;
    getMfaStatus(user: User): Promise<{
        isEnabled: boolean;
        method: string;
        backupCodesCount: number;
    }>;
    regenerateBackupCodes(user: User, regenerateDto: RegenerateBackupCodesDto): Promise<{
        backupCodes: string[];
    }>;
    verifyMFA(verifyMfaDto: MfaDto, req: FastifyRequest, res: FastifyReply, workspace: Workspace): Promise<void>;
    validateMfaAccess(req: FastifyRequest): Promise<{
        valid: boolean;
        isTransferToken: boolean;
        requiresMfaSetup: boolean;
        userHasMfa: boolean;
        isMfaEnforced: boolean;
    } | {
        valid: boolean;
        isTransferToken?: undefined;
        requiresMfaSetup?: undefined;
        userHasMfa?: undefined;
        isMfaEnforced?: undefined;
    }>;
    setAuthCookie(res: FastifyReply, token: string): void;
    private validatePasswordIfRequired;
}
