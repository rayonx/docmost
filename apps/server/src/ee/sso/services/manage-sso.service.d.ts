import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { AuthProvider, Workspace } from "../../../database/types/entity.types";
import { CreateSsoProviderDto, UpdateSsoProviderDto } from "../dto/sso.dto";
export declare class ManageSsoService {
    private readonly db;
    private readonly logger;
    publicFields: Array<keyof AuthProvider>;
    constructor(db: KyselyDB);
    getProviders(workspace: Workspace, pagination: PaginationOptions): Promise<import("@docmost/db/pagination/cursor-pagination").CursorPaginationResult<{
        type: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        name: string;
        settings: import("../../../database/types/db").JsonValue;
        allowSignup: boolean;
        isEnabled: boolean;
        groupSync: boolean;
        ldapBaseDn: string;
        ldapBindDn: string;
        ldapBindPassword: string;
        ldapTlsCaCert: string;
        ldapTlsEnabled: boolean;
        ldapUrl: string;
        ldapUserAttributes: import("../../../database/types/db").JsonValue;
        ldapUserSearchFilter: string;
        ldapConfig: import("../../../database/types/db").JsonValue;
        oidcClientId: string;
        oidcClientSecret: string;
        oidcIssuer: string;
        samlCertificate: string;
        samlUrl: string;
    }, undefined>>;
    getProvider(providerId: string, workspaceId: string): Promise<AuthProvider>;
    createProvider(dto: CreateSsoProviderDto, opts: {
        workspaceId: string;
        creatorId: string;
        trx?: KyselyTransaction;
    }): Promise<AuthProvider>;
    updateProvider(dto: UpdateSsoProviderDto, workspaceId: string): Promise<AuthProvider>;
    deleteProvider(providerId: string, workspaceId: string): Promise<void>;
    private maskSensitiveFields;
}
