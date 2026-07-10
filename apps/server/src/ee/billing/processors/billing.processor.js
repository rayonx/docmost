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
var BillingProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const nestjs_kysely_1 = require("nestjs-kysely");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
const billing_service_1 = require("../services/billing.service");
const constants_1 = require("../../../integrations/queue/constants");
const mail_service_1 = require("../../../integrations/mail/mail.service");
const trial_ended_email_1 = require("../../cloud/emails/trial-ended-email");
const domain_service_1 = require("../../../integrations/environment/domain.service");
const welcome_email_1 = require("../../cloud/emails/welcome-email");
let BillingProcessor = BillingProcessor_1 = class BillingProcessor extends bullmq_1.WorkerHost {
    constructor(db, workspaceRepo, billingService, mailService, domainService) {
        super();
        this.db = db;
        this.workspaceRepo = workspaceRepo;
        this.billingService = billingService;
        this.mailService = mailService;
        this.domainService = domainService;
        this.logger = new common_1.Logger(BillingProcessor_1.name);
    }
    async process(job) {
        try {
            switch (job.name) {
                case constants_1.QueueJob.STRIPE_SEATS_SYNC:
                    {
                        const workspaceId = job.data.workspaceId;
                        if (!workspaceId)
                            return;
                        const billing = await this.billingService.getBillingInfo(workspaceId);
                        if (!billing)
                            return;
                        const activeUserCount = await this.workspaceRepo.getActiveUserCount(workspaceId);
                        if (activeUserCount > parseInt(billing.quantity)) {
                            this.logger.debug(`Updating subscription quantity from ${billing.quantity} to ${activeUserCount} for workspace ${billing.workspaceId}`);
                            await this.billingService.updateSubscriptionQuantity({
                                stripeSubId: billing.stripeSubscriptionId,
                                stripeItemId: billing.stripeItemId,
                                quantity: activeUserCount,
                            });
                        }
                    }
                    break;
                case constants_1.QueueJob.TRIAL_ENDED:
                    {
                        const workspaceId = job.data.workspaceId;
                        if (!workspaceId)
                            return;
                        const workspace = await this.workspaceRepo.findById(workspaceId);
                        if (!workspace)
                            return;
                        const billing = await this.billingService.getBillingInfo(workspaceId);
                        if (billing)
                            return;
                        const billingLink = `${this.domainService.getUrl(workspace.hostname)}/settings/billing`;
                        const emailTemplate = (0, trial_ended_email_1.default)({
                            billingLink,
                            workspaceName: workspace.name,
                        });
                        await this.mailService.sendToQueue({
                            to: workspace.billingEmail,
                            subject: 'Your trial has ended',
                            template: emailTemplate,
                        });
                    }
                    break;
                case constants_1.QueueJob.WELCOME_EMAIL:
                    {
                        const userId = job.data.userId;
                        const user = await this.db
                            .selectFrom('users')
                            .select(['id', 'name', 'email'])
                            .where('id', '=', userId)
                            .executeTakeFirst();
                        if (!user)
                            return;
                        const emailTemplate = (0, welcome_email_1.default)({
                            userName: user.name.split(' ')[0],
                        });
                        const founderEmail = 'founders@docmost.com';
                        await this.mailService.sendToQueue({
                            from: founderEmail,
                            to: user.email,
                            subject: 'Welcome to Docmost',
                            template: emailTemplate,
                        });
                    }
                    break;
                case constants_1.QueueJob.FIRST_PAYMENT_EMAIL:
                    {
                    }
                    break;
            }
        }
        catch (err) {
            throw err;
        }
    }
    onActive(job) {
        this.logger.debug(`Processing ${job.name} job`);
    }
    onError(job) {
        this.logger.error(`Error processing ${job.name} job. Reason: ${job.failedReason}`);
    }
    onCompleted(job) {
        this.logger.debug(`Completed ${job.name} job`);
    }
    async onModuleDestroy() {
        if (this.worker) {
            await this.worker.close();
        }
    }
};
exports.BillingProcessor = BillingProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], BillingProcessor.prototype, "onActive", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], BillingProcessor.prototype, "onError", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], BillingProcessor.prototype, "onCompleted", null);
exports.BillingProcessor = BillingProcessor = BillingProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.BILLING_QUEUE),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, workspace_repo_1.WorkspaceRepo,
        billing_service_1.BillingService,
        mail_service_1.MailService,
        domain_service_1.DomainService])
], BillingProcessor);
//# sourceMappingURL=billing.processor.js.map