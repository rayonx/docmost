import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { PostgresAuditStore } from './postgres-audit.store';
import { IAuditStore } from './audit-store.types';
export declare const auditStoreProvider: {
    provide: string;
    useFactory: (environmentService: EnvironmentService, postgresStore: PostgresAuditStore, clickhouseClient: any | null) => IAuditStore;
    inject: (string | typeof EnvironmentService | typeof PostgresAuditStore)[];
};
