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
var GotenbergClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GotenbergClient = void 0;
const common_1 = require("@nestjs/common");
const environment_service_1 = require("../../integrations/environment/environment.service");
let GotenbergClient = GotenbergClient_1 = class GotenbergClient {
    constructor(environmentService) {
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(GotenbergClient_1.name);
    }
    async convertUrlToPdf(url) {
        const gotenbergUrl = this.environmentService.getGotenbergUrl();
        if (!gotenbergUrl) {
            throw new common_1.BadRequestException('PDF export is not configured. Set GOTENBERG_URL environment variable.');
        }
        const endpoint = `${gotenbergUrl}/forms/chromium/convert/url`;
        const formData = new FormData();
        formData.append('url', url);
        formData.append('paperWidth', '8.27');
        formData.append('paperHeight', '11.7');
        formData.append('marginTop', '0.4');
        formData.append('marginBottom', '0.4');
        formData.append('marginLeft', '0.4');
        formData.append('marginRight', '0.4');
        formData.append('printBackground', 'true');
        formData.append('emulatedMediaType', 'print');
        formData.append('waitDelay', '3s');
        formData.append('waitForExpression', "document.querySelector('.ProseMirror') !== null");
        let response;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30_000),
            });
        }
        catch (err) {
            this.logger.error({ err }, 'Gotenberg request failed');
            throw new common_1.InternalServerErrorException('PDF generation failed.');
        }
        if (!response.ok) {
            const errText = await response.text().catch(() => 'Unknown error');
            this.logger.error(`Gotenberg error (${response.status}): ${errText}`);
            throw new common_1.InternalServerErrorException('PDF generation failed.');
        }
        return Buffer.from(await response.arrayBuffer());
    }
};
exports.GotenbergClient = GotenbergClient;
exports.GotenbergClient = GotenbergClient = GotenbergClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService])
], GotenbergClient);
//# sourceMappingURL=gotenberg.client.js.map