"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVerificationModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const page_verification_service_1 = require("./page-verification.service");
const page_verification_controller_1 = require("./page-verification.controller");
const page_verification_repo_1 = require("./page-verification.repo");
const page_verification_scheduler_service_1 = require("./page-verification-scheduler.service");
const constants_1 = require("../../integrations/queue/constants");
let PageVerificationModule = class PageVerificationModule {
};
exports.PageVerificationModule = PageVerificationModule;
exports.PageVerificationModule = PageVerificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: constants_1.QueueName.NOTIFICATION_QUEUE,
            }),
        ],
        controllers: [page_verification_controller_1.PageVerificationController],
        providers: [
            page_verification_service_1.PageVerificationService,
            page_verification_repo_1.PageVerificationRepo,
            page_verification_scheduler_service_1.PageVerificationSchedulerService,
        ],
        exports: [page_verification_service_1.PageVerificationService, page_verification_scheduler_service_1.PageVerificationSchedulerService],
    })
], PageVerificationModule);
//# sourceMappingURL=page-verification.module.js.map