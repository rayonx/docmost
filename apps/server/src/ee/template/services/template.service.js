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
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const template_repo_1 = require("../../../database/repos/template/template.repo");
const page_repo_1 = require("../../../database/repos/page/page.repo");
const space_member_repo_1 = require("../../../database/repos/space/space-member.repo");
const page_service_1 = require("../../../core/page/services/page.service");
const helpers_1 = require("../../../common/helpers");
let TemplateService = class TemplateService {
    constructor(templateRepo, pageRepo, pageService, spaceMemberRepo) {
        this.templateRepo = templateRepo;
        this.pageRepo = pageRepo;
        this.pageService = pageService;
        this.spaceMemberRepo = spaceMemberRepo;
    }
    async getTemplates(userId, workspaceId, pagination, spaceId) {
        const userSpaces = await this.spaceMemberRepo.getUserSpaceIds(userId);
        return this.templateRepo.findTemplates(workspaceId, userSpaces, pagination, { spaceId });
    }
    async getTemplateById(templateId, workspaceId) {
        const template = await this.templateRepo.findById(templateId, workspaceId, {
            includeContent: true,
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        return template;
    }
    async createTemplate(userId, workspaceId, dto) {
        const template = await this.templateRepo.insertTemplate({
            title: dto.title,
            description: dto.description,
            content: dto.content,
            icon: dto.icon,
            spaceId: dto.spaceId ?? null,
            workspaceId,
            creatorId: userId,
            lastUpdatedById: userId,
            collaboratorIds: [userId],
        });
        return this.templateRepo.findById(template.id, workspaceId, {
            includeContent: true,
        });
    }
    async updateTemplate(userId, workspaceId, dto) {
        const template = await this.templateRepo.findById(dto.templateId, workspaceId);
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const collaboratorIds = template.collaboratorIds ?? [];
        if (!collaboratorIds.includes(userId)) {
            collaboratorIds.push(userId);
        }
        await this.templateRepo.updateTemplate({
            title: dto.title,
            description: dto.description,
            content: dto.content,
            icon: dto.icon,
            spaceId: dto.spaceId !== undefined ? (dto.spaceId ?? null) : undefined,
            lastUpdatedById: userId,
            collaboratorIds,
        }, dto.templateId, workspaceId);
        return this.templateRepo.findById(dto.templateId, workspaceId, {
            includeContent: true,
        });
    }
    async deleteTemplate(templateId, workspaceId) {
        const template = await this.templateRepo.findById(templateId, workspaceId);
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        await this.templateRepo.deleteTemplate(templateId, workspaceId);
    }
    async useTemplate(userId, workspaceId, dto) {
        const template = await this.templateRepo.findById(dto.templateId, workspaceId, { includeContent: true });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const content = template.content;
        const parentPageId = dto.parentPageId ?? null;
        const position = await this.pageService.nextPagePosition(dto.spaceId, parentPageId);
        return this.pageRepo.insertPage({
            slugId: (0, helpers_1.generateSlugId)(),
            title: template.title ?? 'Untitled',
            icon: template.icon,
            position,
            spaceId: dto.spaceId,
            parentPageId,
            creatorId: userId,
            lastUpdatedById: userId,
            workspaceId,
            content,
        });
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [template_repo_1.TemplateRepo,
        page_repo_1.PageRepo,
        page_service_1.PageService,
        space_member_repo_1.SpaceMemberRepo])
], TemplateService);
//# sourceMappingURL=template.service.js.map