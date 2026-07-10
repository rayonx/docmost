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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentEeModule = void 0;
const common_1 = require("@nestjs/common");
const attachment_ee_service_1 = require("./attachment-ee.service");
const attachment_ee_controller_1 = require("./attachment-ee.controller");
let AttachmentEeModule = class AttachmentEeModule {
    constructor(attachmentEeService) {
        this.attachmentEeService = attachmentEeService;
    }
    async onModuleInit() {
        await this.attachmentEeService.triggerAttachmentsIndexing(null, 60 * 1000);
    }
};
exports.AttachmentEeModule = AttachmentEeModule;
exports.AttachmentEeModule = AttachmentEeModule = __decorate([
    (0, common_1.Module)({
        providers: [attachment_ee_service_1.AttachmentEeService],
        exports: [attachment_ee_service_1.AttachmentEeService],
        controllers: [attachment_ee_controller_1.AttachmentEeController],
    }),
    __metadata("design:paramtypes", [attachment_ee_service_1.AttachmentEeService])
], AttachmentEeModule);
//# sourceMappingURL=attachment-ee.module.js.map