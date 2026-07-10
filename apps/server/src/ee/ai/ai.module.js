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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_content_controller_1 = require("./controllers/ai-content.controller");
const ai_service_1 = require("./services/ai.service");
const ai_search_service_1 = require("./services/ai-search.service");
const page_embeddings_repo_1 = require("./repos/page-embeddings.repo");
const vector_processor_1 = require("./processors/vector.processor");
const kysely_1 = require("kysely");
const fs_1 = require("fs");
const path = require("path");
const nestjs_kysely_1 = require("nestjs-kysely");
const ai_provider_1 = require("./providers/ai.provider");
const vector_service_1 = require("./services/vector.service");
const vector_sync_service_1 = require("./services/vector-sync.service");
const environment_service_1 = require("../../integrations/environment/environment.service");
let AiModule = AiModule_1 = class AiModule {
    constructor(db, vectorService, vectorProcessor, environmentService) {
        this.db = db;
        this.vectorService = vectorService;
        this.vectorProcessor = vectorProcessor;
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(AiModule_1.name);
    }
    async onApplicationBootstrap() {
        try {
            if (this.environmentService.getAiDriver()?.length > 0) {
                await this.vectorProcessor.worker.pause();
                await this.vectorMigrations();
                await this.vectorService.validateEmbeddings();
                await this.vectorProcessor.worker.resume();
            }
        }
        catch (err) {
            this.logger.error({ err }, 'AI module bootstrap failed');
            await this.vectorProcessor.worker?.resume();
        }
    }
    async vectorMigrations() {
        const migrationProvider = new kysely_1.FileMigrationProvider({
            fs: fs_1.promises,
            path,
            migrationFolder: path.join(__dirname, 'migrations'),
        });
        const migrations = await migrationProvider.getMigrations();
        const migrationList = Object.keys(migrations)
            .sort()
            .map((name) => ({
            ...migrations[name],
            name,
        }));
        const lockOptions = Object.freeze({
            lockTable: kysely_1.DEFAULT_MIGRATION_LOCK_TABLE,
            lockRowId: kysely_1.MIGRATION_LOCK_ID,
        });
        const pgAdapter = this.db.getExecutor().adapter;
        const run = async (db) => {
            try {
                await pgAdapter.acquireMigrationLock(this.db, lockOptions);
                for (let i = 0; i < migrationList.length; i++) {
                    await migrationList[i].up(this.db);
                }
            }
            finally {
                await pgAdapter.releaseMigrationLock(this.db, lockOptions);
            }
        };
        await this.db.transaction().execute(run);
    }
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = AiModule_1 = __decorate([
    (0, common_1.Module)({
        controllers: [ai_content_controller_1.AiContentController],
        providers: [
            ai_provider_1.aiDriverConfigProvider,
            ai_provider_1.aiDriverProvider,
            ai_service_1.AiService,
            ai_search_service_1.AiSearchService,
            page_embeddings_repo_1.PageEmbeddingsRepo,
            vector_service_1.VectorService,
            vector_sync_service_1.VectorSyncService,
            vector_processor_1.VectorProcessor,
        ],
        exports: [ai_service_1.AiService, ai_search_service_1.AiSearchService, ai_provider_1.aiDriverConfigProvider],
    }),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, vector_service_1.VectorService,
        vector_processor_1.VectorProcessor,
        environment_service_1.EnvironmentService])
], AiModule);
//# sourceMappingURL=ai.module.js.map