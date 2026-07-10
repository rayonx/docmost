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
exports.ScimMiddleware = void 0;
const common_1 = require("@nestjs/common");
const scimmy_1 = require("scimmy");
const domain_service_1 = require("../../integrations/environment/domain.service");
let ScimMiddleware = class ScimMiddleware {
    constructor(domainService) {
        this.domainService = domainService;
    }
    use(req, res, next) {
        const workspace = req['workspace'];
        const location = this.domainService.getUrl(workspace?.hostname) + '/api/scim/v2';
        scimmy_1.default.Resources.ServiceProviderConfig.basepath(location);
        scimmy_1.default.Resources.ResourceType.basepath(location);
        for (const Resource of Object.values(scimmy_1.default.Resources.declared())) {
            Resource.basepath(location);
        }
        next();
    }
};
exports.ScimMiddleware = ScimMiddleware;
exports.ScimMiddleware = ScimMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_service_1.DomainService])
], ScimMiddleware);
//# sourceMappingURL=scim.middleware.js.map