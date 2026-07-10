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
exports.BaseSchemaCacheService = void 0;
const common_1 = require("@nestjs/common");
const base_property_repo_1 = require("../repos/base-property.repo");
let BaseSchemaCacheService = class BaseSchemaCacheService {
    constructor(basePropertyRepo) {
        this.basePropertyRepo = basePropertyRepo;
        this.cache = new Map();
        this.maxEntries = 500;
    }
    async getProperties(pageId, schemaVersion) {
        const key = `${pageId}:${schemaVersion}`;
        const hit = this.cache.get(key);
        if (hit) {
            this.cache.delete(key);
            this.cache.set(key, hit);
            return hit;
        }
        const properties = await this.basePropertyRepo.findByPageId(pageId);
        this.cache.set(key, properties);
        while (this.cache.size > this.maxEntries) {
            this.cache.delete(this.cache.keys().next().value);
        }
        return properties;
    }
};
exports.BaseSchemaCacheService = BaseSchemaCacheService;
exports.BaseSchemaCacheService = BaseSchemaCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [base_property_repo_1.BasePropertyRepo])
], BaseSchemaCacheService);
//# sourceMappingURL=base-schema-cache.service.js.map