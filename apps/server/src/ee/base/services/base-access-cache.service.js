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
var BaseAccessCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAccessCacheService = void 0;
const common_1 = require("@nestjs/common");
const page_access_service_1 = require("../../../core/page/page-access/page-access.service");
let BaseAccessCacheService = BaseAccessCacheService_1 = class BaseAccessCacheService {
    constructor(pageAccessService) {
        this.pageAccessService = pageAccessService;
        this.cache = new Map();
        this.maxEntries = 5000;
    }
    async validateCanEdit(page, user) {
        return this.validate('edit', page, user);
    }
    async validateCanView(page, user) {
        return this.validate('view', page, user);
    }
    async validate(mode, page, user) {
        const key = `${user.id}:${page.id}:${mode}`;
        const expiresAt = this.cache.get(key);
        if (expiresAt !== undefined && expiresAt > Date.now())
            return;
        if (mode === 'edit') {
            await this.pageAccessService.validateCanEdit(page, user);
        }
        else {
            await this.pageAccessService.validateCanView(page, user);
        }
        this.cache.delete(key);
        this.cache.set(key, Date.now() + BaseAccessCacheService_1.TTL_MS);
        while (this.cache.size > this.maxEntries) {
            this.cache.delete(this.cache.keys().next().value);
        }
    }
};
exports.BaseAccessCacheService = BaseAccessCacheService;
BaseAccessCacheService.TTL_MS = 10_000;
exports.BaseAccessCacheService = BaseAccessCacheService = BaseAccessCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [page_access_service_1.PageAccessService])
], BaseAccessCacheService);
//# sourceMappingURL=base-access-cache.service.js.map