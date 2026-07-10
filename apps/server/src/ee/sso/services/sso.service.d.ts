import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { DomainService } from '../../../integrations/environment/domain.service';
import { SSO_PROVIDER } from "../constants";
import { AuthProvider, User } from "../../../database/types/entity.types";
import { UserRepo } from "../../../database/repos/user/user.repo";
import { GroupUserRepo } from "../../../database/repos/group/group-user.repo";
import { HandleSsoOptions } from "../dto/types";
import { FastifyReply, FastifyRequest } from 'fastify';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { Queue } from 'bullmq';
import { IAuditService } from '../../../integrations/audit/audit.service';
export declare class SsoService {
    private domainService;
    private readonly userRepo;
    private readonly groupUserRepo;
    private readonly environmentService;
    private readonly db;
    private billingQueue;
    private readonly auditService;
    private readonly logger;
    constructor(domainService: DomainService, userRepo: UserRepo, groupUserRepo: GroupUserRepo, environmentService: EnvironmentService, db: KyselyDB, billingQueue: Queue, auditService: IAuditService);
    handleAuthentication({ workspace, providerId, providerType, profile, }: HandleSsoOptions): Promise<User>;
    syncUserData(opts: {
        profile: any;
        user: User;
        isNewUser: boolean;
        workspaceId: string;
        trx: KyselyTransaction;
    }): Promise<void>;
    private syncUserGroups;
    private getInvitation;
    hasInvitation(email: string, workspaceId: string, trx: KyselyTransaction): Promise<boolean>;
    clearInvitations(opts: {
        email: string;
        workspaceId: string;
        trx: KyselyTransaction;
    }): Promise<void>;
    getProviderById(opts: {
        providerId: string;
        workspaceId: string;
        type: SSO_PROVIDER;
    }): Promise<AuthProvider>;
    getGoogleProviderForWorkspace(workspaceId: string): Promise<AuthProvider>;
    buildCallbackUrl(opts: {
        providerId: string;
        type: SSO_PROVIDER;
        hostname: string;
    }): string;
    buildRedirectUrl(opts: {
        providerId: string;
        type: SSO_PROVIDER;
        hostname: string;
    }): string;
    buildSamlIssuer(opts: {
        providerId: string;
        hostname: string;
    }): string;
    setCookieAndRedirect(res: FastifyReply, authToken: string, req?: FastifyRequest): void;
    setSsoRedirectCookie(res: FastifyReply, redirect: unknown): void;
}
