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
var PersonalSpaceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalSpaceService = void 0;
const common_1 = require("@nestjs/common");
const space_service_1 = require("../../../core/space/services/space.service");
const space_repo_1 = require("../../../database/repos/space/space.repo");
const favorite_service_1 = require("../../../core/favorite/services/favorite.service");
const favorite_repo_1 = require("../../../database/repos/favorite/favorite.repo");
const helpers_1 = require("../../../common/helpers");
const personal_space_util_1 = require("../personal-space.util");
const MAX_SLUG_SUFFIX = 999;
let PersonalSpaceService = PersonalSpaceService_1 = class PersonalSpaceService {
    constructor(spaceService, spaceRepo, favoriteService) {
        this.spaceService = spaceService;
        this.spaceRepo = spaceRepo;
        this.favoriteService = favoriteService;
        this.logger = new common_1.Logger(PersonalSpaceService_1.name);
    }
    async findForUser(userId, workspaceId) {
        const space = await this.spaceRepo.findPersonalSpace(userId, workspaceId);
        return space ?? null;
    }
    async createForUser(user, workspace, name) {
        if (!this.isSettingEnabled(workspace)) {
            throw new common_1.ForbiddenException('Personal spaces are disabled');
        }
        const existing = await this.spaceRepo.findPersonalSpace(user.id, workspace.id);
        if (existing) {
            throw new common_1.ConflictException('You already have a personal space');
        }
        try {
            return await this.insertPersonalSpace(user, workspace.id, name);
        }
        catch (err) {
            if (this.isPersonalSpaceConflict(err)) {
                throw new common_1.ConflictException('You already have a personal space');
            }
            throw err;
        }
    }
    async insertPersonalSpace(user, workspaceId, name) {
        const spaceName = name?.trim() || (0, personal_space_util_1.derivePersonalSpaceName)(user);
        const slug = await this.generateUniqueSlug(spaceName, workspaceId);
        const space = await this.spaceService.createSpace(user, workspaceId, { name: spaceName, slug, description: '' }, undefined, { isPersonal: true });
        try {
            await this.favoriteService.addFavorite(user.id, workspaceId, {
                type: favorite_repo_1.FavoriteType.SPACE,
                spaceId: space.id,
            });
        }
        catch (err) {
            this.logger.error(`Failed to favorite personal space ${space.id}: ${err}`);
        }
        return space;
    }
    async generateUniqueSlug(name, workspaceId) {
        const base = (0, personal_space_util_1.sanitizeSlugBase)(name) || 'space';
        if (!(await this.spaceRepo.slugExists(base, workspaceId))) {
            return base;
        }
        for (let suffix = 1; suffix <= MAX_SLUG_SUFFIX; suffix++) {
            const candidate = `${base}${suffix}`;
            if (!(await this.spaceRepo.slugExists(candidate, workspaceId))) {
                return candidate;
            }
        }
        return `${base}${(0, helpers_1.nanoIdGen)()}`;
    }
    isSettingEnabled(ws) {
        const settings = (ws.settings ?? {});
        return settings?.spaces?.allowPersonal === true;
    }
    isPersonalSpaceConflict(err) {
        const message = err?.message ?? '';
        return message.includes('spaces_personal_creator_unique');
    }
};
exports.PersonalSpaceService = PersonalSpaceService;
exports.PersonalSpaceService = PersonalSpaceService = PersonalSpaceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [space_service_1.SpaceService,
        space_repo_1.SpaceRepo,
        favorite_service_1.FavoriteService])
], PersonalSpaceService);
//# sourceMappingURL=personal-space.service.js.map