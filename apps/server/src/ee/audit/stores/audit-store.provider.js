"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditStoreProvider = void 0;
const environment_service_1 = require("../../../integrations/environment/environment.service");
const postgres_audit_store_1 = require("./postgres-audit.store");
const clickhouse_audit_store_1 = require("./clickhouse-audit.store");
const audit_store_types_1 = require("./audit-store.types");
const clickhouse_constants_1 = require("../../clickhouse/clickhouse.constants");
exports.auditStoreProvider = {
    provide: audit_store_types_1.AUDIT_STORE,
    useFactory: (environmentService, postgresStore, clickhouseClient) => {
        if (environmentService.getEventStoreDriver() === 'clickhouse' &&
            clickhouseClient) {
            return new clickhouse_audit_store_1.ClickHouseAuditStore(clickhouseClient);
        }
        return postgresStore;
    },
    inject: [environment_service_1.EnvironmentService, postgres_audit_store_1.PostgresAuditStore, clickhouse_constants_1.CLICKHOUSE_CLIENT],
};
//# sourceMappingURL=audit-store.provider.js.map