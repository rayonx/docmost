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
var TypesenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseService = void 0;
const common_1 = require("@nestjs/common");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const Typesense = require("typesense");
const page_schema_1 = require("../schemas/page.schema");
const attachment_schema_1 = require("../schemas/attachment.schema");
const comment_schema_1 = require("../schemas/comment.schema");
let TypesenseService = TypesenseService_1 = class TypesenseService {
    constructor(environmentService) {
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(TypesenseService_1.name);
        if (environmentService.getSearchDriver() === 'typesense') {
            this.typesenseClient = new Typesense.Client({
                nodes: [
                    {
                        url: this.environmentService.getTypesenseUrl(),
                    },
                ],
                apiKey: this.environmentService.getTypesenseApiKey(),
                connectionTimeoutSeconds: 5,
                numRetries: 1,
                retryIntervalSeconds: 0.1,
                logLevel: 'error',
            });
        }
    }
    getClient() {
        return this.typesenseClient;
    }
    isTypesenseEnabled() {
        return this.environmentService.getSearchDriver() === 'typesense';
    }
    async createCollections() {
        const schemas = [page_schema_1.pageSchema, attachment_schema_1.attachmentSchema, comment_schema_1.commentSchema];
        for (const schema of schemas) {
            try {
                const collectionExists = await this.typesenseClient
                    .collections(schema.name)
                    .exists();
                if (collectionExists) {
                    this.logger.debug(`Collection ${schema.name} already exists`);
                    continue;
                }
                await this.typesenseClient.collections().create(schema);
                this.logger.log(`Created Typesense collection ${schema.name}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to create collection ${schema.name}: ${errorMessage}`);
                throw error;
            }
        }
    }
};
exports.TypesenseService = TypesenseService;
exports.TypesenseService = TypesenseService = TypesenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService])
], TypesenseService);
//# sourceMappingURL=typesense.service.js.map