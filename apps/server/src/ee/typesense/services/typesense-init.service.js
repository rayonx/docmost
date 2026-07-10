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
var TypesenseInitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseInitService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const typesense_service_1 = require("./typesense.service");
const constants_1 = require("../constants");
const page_search_service_1 = require("./page-search.service");
const typesense_util_1 = require("../typesense.util");
let TypesenseInitService = TypesenseInitService_1 = class TypesenseInitService {
    constructor(db, typesenseService, pageSearchService) {
        this.db = db;
        this.typesenseService = typesenseService;
        this.pageSearchService = pageSearchService;
        this.logger = new common_1.Logger(TypesenseInitService_1.name);
    }
    async onApplicationBootstrap() {
        await this.pageSearchService.triggerPageIndexing(undefined, 10 * 1000);
    }
    async checkAndSync() {
        await this.checkCollection(constants_1.CollectionSchema.PAGE);
    }
    async checkCollection(collectionName) {
        try {
            const exists = await this.typesenseService
                .getClient()
                .collections(collectionName)
                .exists();
            if (!exists) {
                this.logger.log(`Collection ${collectionName} does not exist, creating and indexing...`);
                await this.createAndIndex(collectionName);
                return;
            }
            const localeMatches = await this.checkLocale(collectionName);
            if (!localeMatches) {
                this.logger.log(`Typesense Collection ${collectionName} locale mismatch, dropping and recreating...`);
                await this.dropAndRecreate(collectionName);
                return;
            }
            const needsSync = await this.needsSync(collectionName);
            if (needsSync) {
                this.logger.debug(`Collection ${collectionName} is out of sync, triggering re-index...`);
                await this.createAndIndex(collectionName);
            }
            else {
                this.logger.debug(`Collection ${collectionName} is in sync`);
            }
        }
        catch (error) {
            throw new Error((0, typesense_util_1.extractTypesenseError)(error));
        }
    }
    async checkLocale(collectionName) {
        try {
            const collection = await this.typesenseService
                .getClient()
                .collections(collectionName)
                .retrieve();
            const titleField = collection.fields?.find((f) => f.name === 'title');
            const textContentField = collection.fields?.find((f) => f.name === 'textContent');
            const titleLocale = titleField?.locale;
            const textContentLocale = textContentField?.locale;
            return (titleLocale === constants_1.TYPESENSE_LOCALE &&
                textContentLocale === constants_1.TYPESENSE_LOCALE);
        }
        catch (error) {
            this.logger.error({ err: error }, `Error checking locale for ${collectionName}`);
            return false;
        }
    }
    async dropAndRecreate(collectionName) {
        try {
            await this.typesenseService
                .getClient()
                .collections(collectionName)
                .delete();
            this.logger.debug(`Dropped collection ${collectionName}`);
        }
        catch (error) {
            this.logger.error({ err: error }, `Error dropping collection ${collectionName}`);
        }
        await this.createAndIndex(collectionName);
    }
    async needsSync(collectionName) {
        try {
            const dbCount = await this.getDbCount(collectionName);
            const tsCount = await this.getTypesenseCount(collectionName);
            this.logger.debug(`${collectionName} - DB: ${dbCount}, Typesense: ${tsCount}`);
            const variance = Math.abs(dbCount - tsCount);
            const threshold = Math.max(1, Math.floor(dbCount * 0.05));
            return variance > threshold;
        }
        catch (error) {
            this.logger.error({ err: error }, `Error checking sync status for ${collectionName}`);
            return true;
        }
    }
    async getDbCount(collectionName) {
        let tableName;
        switch (collectionName) {
            case constants_1.CollectionSchema.PAGE:
                tableName = 'pages';
                break;
            case constants_1.CollectionSchema.ATTACHMENT:
                tableName = 'attachments';
                break;
            case constants_1.CollectionSchema.COMMENT:
                tableName = 'comments';
                break;
            default:
                throw new Error(`Unknown collection: ${collectionName}`);
        }
        const result = await this.db
            .selectFrom(tableName)
            .select((eb) => eb.fn.count('id').as('count'))
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
        return Number(result?.count || 0);
    }
    async getTypesenseCount(collectionName) {
        try {
            const collection = await this.typesenseService
                .getClient()
                .collections(collectionName)
                .retrieve();
            return collection.num_documents || 0;
        }
        catch (error) {
            this.logger.error({ err: error }, `Error getting Typesense count for ${collectionName}`);
            return 0;
        }
    }
    async createAndIndex(collectionName) {
        try {
            switch (collectionName) {
                case constants_1.CollectionSchema.PAGE:
                    await this.pageSearchService.createPagesCollection();
                    await this.pageSearchService.indexAllPages();
                    break;
                default:
                    this.logger.warn(`No indexing handler for ${collectionName}`);
            }
        }
        catch (error) {
            throw new Error((0, typesense_util_1.extractTypesenseError)(error));
        }
    }
};
exports.TypesenseInitService = TypesenseInitService;
exports.TypesenseInitService = TypesenseInitService = TypesenseInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, typesense_service_1.TypesenseService,
        page_search_service_1.PageSearchService])
], TypesenseInitService);
//# sourceMappingURL=typesense-init.service.js.map