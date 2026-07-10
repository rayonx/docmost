"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditModule = void 0;
const common_1 = require("@nestjs/common");
const audit_controller_1 = require("./audit.controller");
const audit_service_1 = require("./services/audit.service");
const audit_query_service_1 = require("./services/audit-query.service");
const audit_cleanup_service_1 = require("./services/audit-cleanup.service");
const audit_processor_1 = require("./processors/audit.processor");
const postgres_audit_store_1 = require("./stores/postgres-audit.store");
const audit_store_provider_1 = require("./stores/audit-store.provider");
const audit_service_2 = require("../../integrations/audit/audit.service");
let AuditModule = class AuditModule {
};
exports.AuditModule = AuditModule;
exports.AuditModule = AuditModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [audit_controller_1.AuditController],
        providers: [
            audit_service_1.AuditService,
            audit_query_service_1.AuditQueryService,
            audit_cleanup_service_1.AuditCleanupService,
            audit_processor_1.AuditProcessor,
            postgres_audit_store_1.PostgresAuditStore,
            audit_store_provider_1.auditStoreProvider,
            {
                provide: audit_service_2.AUDIT_SERVICE,
                useExisting: audit_service_1.AuditService,
            },
        ],
        exports: [audit_service_2.AUDIT_SERVICE],
    })
], AuditModule);
//# sourceMappingURL=audit.module.js.map