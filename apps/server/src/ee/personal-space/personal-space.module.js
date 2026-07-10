"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalSpaceModule = void 0;
const common_1 = require("@nestjs/common");
const space_module_1 = require("../../core/space/space.module");
const favorite_module_1 = require("../../core/favorite/favorite.module");
const personal_space_service_1 = require("./services/personal-space.service");
const personal_space_controller_1 = require("./personal-space.controller");
let PersonalSpaceModule = class PersonalSpaceModule {
};
exports.PersonalSpaceModule = PersonalSpaceModule;
exports.PersonalSpaceModule = PersonalSpaceModule = __decorate([
    (0, common_1.Module)({
        imports: [space_module_1.SpaceModule, favorite_module_1.FavoriteModule],
        controllers: [personal_space_controller_1.PersonalSpaceController],
        providers: [personal_space_service_1.PersonalSpaceService],
        exports: [personal_space_service_1.PersonalSpaceService],
    })
], PersonalSpaceModule);
//# sourceMappingURL=personal-space.module.js.map