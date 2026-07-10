"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseModule = void 0;
const common_1 = require("@nestjs/common");
const typesense_service_1 = require("./services/typesense.service");
const page_search_service_1 = require("./services/page-search.service");
const search_processor_1 = require("./processor/search.processor");
const typesense_init_service_1 = require("./services/typesense-init.service");
const typesense_sync_service_1 = require("./services/typesense-sync.service");
let TypesenseModule = class TypesenseModule {
};
exports.TypesenseModule = TypesenseModule;
exports.TypesenseModule = TypesenseModule = __decorate([
    (0, common_1.Module)({
        providers: [
            typesense_service_1.TypesenseService,
            page_search_service_1.PageSearchService,
            search_processor_1.SearchProcessor,
            typesense_init_service_1.TypesenseInitService,
            typesense_sync_service_1.TypesenseSyncService,
        ],
        exports: [typesense_sync_service_1.TypesenseSyncService, page_search_service_1.PageSearchService],
    })
], TypesenseModule);
//# sourceMappingURL=typesense.module.js.map