import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { TokenService } from '../../../core/auth/services/token.service';
import { SessionService } from '../../../core/session/session.service';
import { KyselyDB } from "../../../database/types/kysely.types";
import { MfaLoginResult } from "../dto/mfa.dto";
import { FastifyReply, FastifyRequest } from 'fastify';
import { InsertableUserMFA, User, Workspace } from "../../../database/types/entity.types";
import { UserRepo } from "../../../database/repos/user/user.repo";
import { LoginDto } from '../../../core/auth/dto/login.dto';
import { UserMfa } from '@docmost/db/types/db';
export declare class MfaService {
    private readonly db;
    private readonly environmentService;
    private readonly tokenService;
    private readonly sessionService;
    private readonly userRepo;
    constructor(db: KyselyDB, environmentService: EnvironmentService, tokenService: TokenService, sessionService: SessionService, userRepo: UserRepo);
    getUserMfa(userId: string, opts?: {
        includeBackupCodes?: boolean;
        includeSecret?: boolean;
    }): Promise<InsertableUserMFA>;
    setupMfa(userId: string, workspaceId: string, email: string, workspaceName: string): Promise<{
        qrCode: string;
        manualKey: string;
    }>;
    enableMfa(userId: string, verificationCode: string): Promise<{
        backupCodes: string[];
    }>;
    disableMfa(userId: string): Promise<void>;
    isMfaEnabled(userId: string): Promise<boolean>;
    generateTOTPSecret(email: string, workspaceName: string): Promise<{
        secret: string;
        qrCode: string;
        manualKey: string;
    }>;
    verifyTOTPToken(opts: {
        mfaSecret: string;
        code: string;
    }): boolean;
    verifyBackupCode(opts: {
        userId: string;
        code: string;
    }): Promise<boolean>;
    regenerateBackupCodes(userId: string): Promise<{
        backupCodes: string[];
    }>;
    verifyMfaCode(userId: string, code: string): Promise<boolean>;
    verifyMfa(opts: {
        code: string;
        workspaceId: string;
        req: FastifyRequest;
    }): Promise<{
        authToken: string;
        userId: string;
    }>;
    loginWithMfaCheck(loginDto: LoginDto, workspaceId: string, isLdap?: boolean): Promise<MfaLoginResult & {
        user?: User;
        userMfa?: UserMfa;
    }>;
    checkMfaRequirements(loginDto: LoginDto, workspace: Workspace, res: FastifyReply, isLdap?: boolean): Promise<MfaLoginResult | null>;
    setMfaTokenCookie(mfaToken: string, res: FastifyReply): void;
}
