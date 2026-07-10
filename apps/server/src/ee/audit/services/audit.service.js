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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const nestjs_cls_1 = require("nestjs-cls");
const cache_manager_1 = require("@nestjs/cache-manager");
const constants_1 = require("../../../integrations/queue/constants");
const audit_context_middleware_1 = require("../../../common/middlewares/audit-context.middleware");
const audit_events_1 = require("../../../common/events/audit-events");
const nestjs_kysely_1 = require("nestjs-kysely");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const license_check_service_1 = require("../../../integrations/environment/license-check.service");
const cache_keys_1 = require("../../../common/helpers/cache-keys");
const LICENSE_CACHE_TTL = 60 * 60 * 1000;
let AuditService = AuditService_1 = class AuditService {
    constructor(auditQueue, cls, cacheManager, db, environmentService, licenseCheckService) {
        this.auditQueue = auditQueue;
        this.cls = cls;
        this.cacheManager = cacheManager;
        this.db = db;
        this.environmentService = environmentService;
        this.licenseCheckService = licenseCheckService;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async log(payload) {
        try {
            const context = this.cls.get(audit_context_middleware_1.AUDIT_CONTEXT_KEY);
            if (!context?.workspaceId) {
                this.logger.warn('Audit log skipped: no workspace context');
                return;
            }
            if (audit_events_1.EXCLUDED_AUDIT_EVENTS.has(payload.event))
                return;
            if (!(await this.isLicensed(context.workspaceId))) {
                return;
            }
            const auditData = {
                ...payload,
                workspaceId: context.workspaceId,
                actorId: context.actorId,
                actorType: context.actorType,
                ipAddress: context.ipAddress,
            };
            await this.auditQueue.add(constants_1.QueueJob.AUDIT_LOG, auditData);
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to queue audit log');
        }
    }
    async logWithContext(payload, context) {
        try {
            if (audit_events_1.EXCLUDED_AUDIT_EVENTS.has(payload.event))
                return;
            if (!(await this.isLicensed(context.workspaceId))) {
                return;
            }
            const auditData = {
                ...payload,
                workspaceId: context.workspaceId,
                actorId: context.actorId,
                actorType: context.actorType ?? 'user',
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
            };
            await this.auditQueue.add(constants_1.QueueJob.AUDIT_LOG, auditData);
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to queue audit log');
        }
    }
    async logBatchWithContext(payloads, context) {
        const filtered = payloads.filter((p) => !audit_events_1.EXCLUDED_AUDIT_EVENTS.has(p.event));
        if (filtered.length === 0)
            return;
        try {
            if (!(await this.isLicensed(context.workspaceId))) {
                return;
            }
            const jobs = filtered.map((payload) => ({
                name: constants_1.QueueJob.AUDIT_LOG,
                data: {
                    ...payload,
                    workspaceId: context.workspaceId,
                    actorId: context.actorId,
                    actorType: context.actorType ?? 'user',
                    ipAddress: context.ipAddress,
                    userAgent: context.userAgent,
                },
            }));
            await this.auditQueue.addBulk(jobs);
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to queue batch audit logs');
        }
    }
    async isLicensed(workspaceId) {
        const cacheKey = cache_keys_1.CacheKey.LICENSE_VALID(workspaceId);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached !== undefined && cached !== null) {
            return cached;
        }
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['licenseKey', 'plan'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        const licensed = this.licenseCheckService.hasFeature(workspace?.licenseKey, 'audit:logs', workspace?.plan);
        await this.cacheManager.set(cacheKey, licensed, LICENSE_CACHE_TTL);
        return licensed;
    }
    setActorId(actorId) {
        const context = this.cls.get(audit_context_middleware_1.AUDIT_CONTEXT_KEY);
        if (context) {
            context.actorId = actorId;
            this.cls.set(audit_context_middleware_1.AUDIT_CONTEXT_KEY, context);
        }
    }
    setActorType(actorType) {
        const context = this.cls.get(audit_context_middleware_1.AUDIT_CONTEXT_KEY);
        if (context) {
            context.actorType = actorType;
            this.cls.set(audit_context_middleware_1.AUDIT_CONTEXT_KEY, context);
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(constants_1.QueueName.AUDIT_QUEUE)),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(3, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        nestjs_cls_1.ClsService, Object, Object, environment_service_1.EnvironmentService,
        license_check_service_1.LicenseCheckService])
], AuditService);
//# sourceMappingURL=audit.service.js.map