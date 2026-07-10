"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModule = void 0;
const common_1 = require("@nestjs/common");
const base_repo_1 = require("./repos/base.repo");
const base_property_repo_1 = require("./repos/base-property.repo");
const base_row_repo_1 = require("./repos/base-row.repo");
const base_view_repo_1 = require("./repos/base-view.repo");
const base_controller_1 = require("./controllers/base.controller");
const base_property_controller_1 = require("./controllers/base-property.controller");
const base_row_controller_1 = require("./controllers/base-row.controller");
const base_view_controller_1 = require("./controllers/base-view.controller");
const base_service_1 = require("./services/base.service");
const base_property_service_1 = require("./services/base-property.service");
const base_row_service_1 = require("./services/base-row.service");
const base_view_service_1 = require("./services/base-view.service");
const base_csv_export_service_1 = require("./services/base-csv-export.service");
const base_page_resolver_service_1 = require("./services/base-page-resolver.service");
const base_schema_cache_service_1 = require("./services/base-schema-cache.service");
const base_queue_processor_1 = require("./processors/base-queue.processor");
const base_ws_service_1 = require("./realtime/base-ws.service");
const base_ws_consumers_1 = require("./realtime/base-ws-consumers");
const base_presence_service_1 = require("./realtime/base-presence.service");
const formula_service_1 = require("./formula/formula.service");
const formula_lock_1 = require("./formula/formula-lock");
const base_access_cache_service_1 = require("./services/base-access-cache.service");
const page_module_1 = require("../../core/page/page.module");
let BaseModule = class BaseModule {
};
exports.BaseModule = BaseModule;
exports.BaseModule = BaseModule = __decorate([
    (0, common_1.Module)({
        imports: [page_module_1.PageModule],
        controllers: [
            base_controller_1.BaseController,
            base_property_controller_1.BasePropertyController,
            base_row_controller_1.BaseRowController,
            base_view_controller_1.BaseViewController,
        ],
        providers: [
            base_repo_1.BaseRepo,
            base_property_repo_1.BasePropertyRepo,
            base_row_repo_1.BaseRowRepo,
            base_view_repo_1.BaseViewRepo,
            base_service_1.BaseService,
            base_property_service_1.BasePropertyService,
            base_row_service_1.BaseRowService,
            base_view_service_1.BaseViewService,
            base_csv_export_service_1.BaseCsvExportService,
            base_page_resolver_service_1.BasePageResolverService,
            base_schema_cache_service_1.BaseSchemaCacheService,
            base_queue_processor_1.BaseQueueProcessor,
            base_presence_service_1.BasePresenceService,
            base_ws_service_1.BaseWsService,
            base_ws_consumers_1.BaseWsConsumers,
            formula_service_1.FormulaService,
            formula_lock_1.FormulaLockService,
            base_access_cache_service_1.BaseAccessCacheService,
        ],
        exports: [
            base_repo_1.BaseRepo,
            base_property_repo_1.BasePropertyRepo,
            base_row_repo_1.BaseRowRepo,
            base_view_repo_1.BaseViewRepo,
            base_service_1.BaseService,
            base_property_service_1.BasePropertyService,
            base_row_service_1.BaseRowService,
            base_view_service_1.BaseViewService,
            base_ws_service_1.BaseWsService,
            base_presence_service_1.BasePresenceService,
            formula_service_1.FormulaService,
            formula_lock_1.FormulaLockService,
        ],
    })
], BaseModule);
//# sourceMappingURL=base.module.js.map