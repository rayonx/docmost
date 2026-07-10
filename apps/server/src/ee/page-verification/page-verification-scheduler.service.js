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
var PageVerificationSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVerificationSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../integrations/queue/constants");
const page_verification_repo_1 = require("./page-verification.repo");
const EXPIRING_LEAD_MS = 4 * 24 * 60 * 60 * 1000;
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
const RECONCILE_EVERY_MS = 24 * 60 * 60 * 1000;
const RECONCILE_JOB_ID = 'verification-reconcile-scheduler';
let PageVerificationSchedulerService = PageVerificationSchedulerService_1 = class PageVerificationSchedulerService {
    constructor(notificationQueue, verificationRepo) {
        this.notificationQueue = notificationQueue;
        this.verificationRepo = verificationRepo;
        this.logger = new common_1.Logger(PageVerificationSchedulerService_1.name);
    }
    async onApplicationBootstrap() {
        try {
            await this.notificationQueue.upsertJobScheduler(RECONCILE_JOB_ID, { every: RECONCILE_EVERY_MS }, {
                name: constants_1.QueueJob.VERIFICATION_RECONCILE,
                data: {},
                opts: { removeOnComplete: true, removeOnFail: false },
            });
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to register reconcile scheduler');
        }
        try {
            await this.reconcile();
        }
        catch (error) {
            this.logger.error({ err: error }, 'Bootstrap reconcile failed');
        }
    }
    async reschedule(verificationId, expiresAt) {
        const expiringJobId = this.expiringJobId(verificationId);
        const expiredJobId = this.expiredJobId(verificationId);
        await Promise.all([this.cancel(expiringJobId), this.cancel(expiredJobId)]);
        if (!expiresAt)
            return;
        const now = Date.now();
        const expiresAtMs = new Date(expiresAt).getTime();
        if (expiresAtMs < now - STALE_THRESHOLD_MS)
            return;
        const expiringDelay = expiresAtMs - EXPIRING_LEAD_MS - now;
        const expiredDelay = expiresAtMs - now;
        const commonOpts = {
            attempts: 3,
            backoff: { type: 'exponential', delay: 60_000 },
            removeOnComplete: true,
            removeOnFail: false,
        };
        const bulk = [];
        bulk.push({
            name: constants_1.QueueJob.PAGE_VERIFICATION_EXPIRING,
            data: { verificationId },
            opts: {
                ...commonOpts,
                jobId: expiringJobId,
                delay: Math.max(expiringDelay, 0),
            },
        });
        bulk.push({
            name: constants_1.QueueJob.PAGE_VERIFICATION_EXPIRED,
            data: { verificationId },
            opts: {
                ...commonOpts,
                jobId: expiredJobId,
                delay: Math.max(expiredDelay, 0),
            },
        });
        try {
            await this.notificationQueue.addBulk(bulk);
        }
        catch (error) {
            this.logger.error({ err: error }, `Failed to reschedule notifications for verification ${verificationId}`);
        }
    }
    async reconcile() {
        const rows = await this.verificationRepo.findAllWithExpiry();
        this.logger.debug(`Reconciling ${rows.length} verification notification schedules`);
        for (const row of rows) {
            try {
                await this.reschedule(row.id, row.expiresAt);
            }
            catch (error) {
                this.logger.error({ err: error }, `Reconcile failed for verification ${row.id}`);
            }
        }
    }
    async cancel(jobId) {
        try {
            const job = await this.notificationQueue.getJob(jobId);
            if (job)
                await job.remove();
        }
        catch (error) {
            this.logger.warn(`Failed to cancel job ${jobId}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
    }
    expiringJobId(verificationId) {
        return `verification-expiring-${verificationId}`;
    }
    expiredJobId(verificationId) {
        return `verification-expired-${verificationId}`;
    }
};
exports.PageVerificationSchedulerService = PageVerificationSchedulerService;
exports.PageVerificationSchedulerService = PageVerificationSchedulerService = PageVerificationSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(constants_1.QueueName.NOTIFICATION_QUEUE)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        page_verification_repo_1.PageVerificationRepo])
], PageVerificationSchedulerService);
//# sourceMappingURL=page-verification-scheduler.service.js.map