"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditCleanupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const nestjs_kysely_1 = require("nestjs-kysely");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../integrations/queue/constants");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const DEFAULT_RETENTION_DAYS = 365;
let AuditCleanupService = AuditCleanupService_1 = class AuditCleanupService {
    constructor(db, auditQueue, environmentService) {
        this.db = db;
        this.auditQueue = auditQueue;
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(AuditCleanupService_1.name);
    }
    async scheduleCleanup() {
        if (this.environmentService.isCloud())
            return;
        try {
            this.logger.debug('Starting audit log cleanup scheduling');
            const workspaces = await this.db
                .selectFrom('workspaces')
                .select(['id', 'auditRetentionDays'])
                .where('deletedAt', 'is', null)
                .execute();
            for (const workspace of workspaces) {
                const retentionDays = workspace.auditRetentionDays ?? DEFAULT_RETENTION_DAYS;
                await this.auditQueue.add(constants_1.QueueJob.AUDIT_CLEANUP, { workspaceId: workspace.id, retentionDays }, {
                    jobId: `audit-cleanup-${workspace.id}`,
                    removeOnComplete: true,
                    removeOnFail: true,
                });
            }
            this.logger.debug(`Scheduled audit cleanup for ${workspaces.length} workspace(s)`);
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to schedule audit cleanup');
        }
    }
};
exports.AuditCleanupService = AuditCleanupService;
__decorate([
    (0, schedule_1.Interval)('audit-cleanup', 5 * 24 * 60 * 60 * 1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditCleanupService.prototype, "scheduleCleanup", null);
exports.AuditCleanupService = AuditCleanupService = AuditCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(1, (0, bullmq_1.InjectQueue)(constants_1.QueueName.AUDIT_QUEUE)),
    __metadata("design:paramtypes", [Object, bullmq_2.Queue,
        environment_service_1.EnvironmentService])
], AuditCleanupService);
//# sourceMappingURL=audit-cleanup.service.js.map