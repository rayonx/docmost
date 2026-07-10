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
var AiSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSearchService = void 0;
const common_1 = require("@nestjs/common");
const textsplitters_1 = require("@langchain/textsplitters");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const page_embeddings_repo_1 = require("../repos/page-embeddings.repo");
const page_repo_1 = require("../../../database/repos/page/page.repo");
const utils_1 = require("../../../database/utils");
const nestjs_kysely_1 = require("nestjs-kysely");
const pgvector = require("pgvector/kysely");
const kysely_1 = require("pgvector/kysely");
const kysely_2 = require("kysely");
const space_member_repo_1 = require("../../../database/repos/space/space-member.repo");
const page_permission_repo_1 = require("../../../database/repos/page/page-permission.repo");
const ai_service_1 = require("./ai.service");
const ai_constants_1 = require("../ai.constants");
const locale_language_1 = require("../utils/locale-language");
let AiSearchService = AiSearchService_1 = class AiSearchService {
    constructor(aiService, environmentService, pageEmbeddingsRepo, pageRepo, spaceMemberRepo, pagePermissionRepo, db) {
        this.aiService = aiService;
        this.environmentService = environmentService;
        this.pageEmbeddingsRepo = pageEmbeddingsRepo;
        this.pageRepo = pageRepo;
        this.spaceMemberRepo = spaceMemberRepo;
        this.pagePermissionRepo = pagePermissionRepo;
        this.db = db;
        this.logger = new common_1.Logger(AiSearchService_1.name);
        this.textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 5500,
            chunkOverlap: 200,
            separators: [
                '\n\n',
                '\n',
                '. ',
                ', ',
                ' ',
                '',
            ],
        });
    }
    async searchSimilarPages(searchParams, opts) {
        const { query } = searchParams;
        const searchQuery = query?.trim();
        if (!searchQuery || searchQuery.length < 1) {
            return;
        }
        if (!this.environmentService.getAiEmbeddingModel()?.length) {
            throw new common_1.BadRequestException('AI embedding model is not configured');
        }
        const embedding = await this.aiService.generateEmbeddings(query);
        let dbQuery = this.db
            .selectFrom('pageEmbeddings as pe')
            .innerJoin('pages as p', 'p.id', 'pe.pageId')
            .innerJoin('spaces as s', 's.id', 'pe.spaceId')
            .select([
            'pe.id',
            'pe.pageId',
            'pe.spaceId',
            'pe.workspaceId',
            'pe.chunkIndex',
            'pe.chunkStart',
            'pe.chunkLength',
            'pe.metadata',
            'p.title',
            'p.slugId',
            's.slug as spaceSlug',
            (0, kysely_2.sql) `pe.embedding <=> ${pgvector.toSql(embedding)}`.as('distance'),
            (0, kysely_2.sql) `1 - (pe.embedding <=> ${pgvector.toSql(embedding)})`.as('similarity'),
        ])
            .where((0, kysely_1.cosineDistance)('embedding', embedding), '<', 0.9)
            .orderBy((0, kysely_1.cosineDistance)('embedding', embedding))
            .limit(20);
        if (searchParams?.spaceId) {
            dbQuery = dbQuery.where('pe.spaceId', '=', searchParams.spaceId);
        }
        else {
            dbQuery = dbQuery.where('pe.spaceId', 'in', this.spaceMemberRepo.getUserSpaceIdsQuery(opts.userId));
        }
        let results = await dbQuery.execute();
        if (results.length > 0) {
            const pageIds = [...new Set(results.map((r) => r.pageId))];
            const accessibleIds = await this.pagePermissionRepo.filterAccessiblePageIds({
                pageIds,
                userId: opts.userId,
            });
            const accessibleSet = new Set(accessibleIds);
            results = results.filter((r) => accessibleSet.has(r.pageId));
        }
        return results;
    }
    async askAiSearch(searchParams, opts) {
        const { userId, workspaceId, locale } = opts;
        const { query } = searchParams;
        const embeddingsTableExists = await this.pageEmbeddingsRepo.isPageEmbeddingsTableExists();
        if (!embeddingsTableExists) {
            throw new common_1.BadRequestException('AI embeddings database not configured');
        }
        if (!this.aiService.isDriverConfigured()) {
            throw new common_1.BadRequestException('AI driver is not configured');
        }
        const languageDirective = (0, locale_language_1.buildLanguageDirective)(locale);
        const defaultLanguage = (0, locale_language_1.languageFromLocale)(locale);
        const systemPrompt = 'You are a helpful AI assistant for a collaborative team workspace.' +
            ' Answer questions based on the provided context from pages in the workspace. Be concise, accurate, and professional.' +
            `\n\n${languageDirective}`;
        const searchResults = await this.searchSimilarPages(searchParams, {
            userId,
            workspaceId,
        });
        if (!searchResults || searchResults.length === 0) {
            async function* emptyStream() {
                yield "I couldn't find any relevant pages in your workspace for that query.";
            }
            return {
                stream: emptyStream(),
                sources: [],
            };
        }
        const pageIds = [...new Set(searchResults.map((r) => r.pageId))];
        const pages = await this.db
            .selectFrom('pages')
            .select(['id', 'textContent'])
            .where('id', 'in', pageIds)
            .execute();
        const pageContentMap = new Map(pages.map((p) => [p.id, p.textContent]));
        const validChunks = searchResults
            .map((result) => {
            const pageContent = pageContentMap.get(result.pageId);
            if (!pageContent)
                return null;
            const chunkText = pageContent.substring(result.chunkStart, result.chunkStart + result.chunkLength);
            return {
                pageId: result.pageId,
                title: result.title,
                slugId: result.slugId,
                spaceSlug: result.spaceSlug,
                chunkText,
                distance: result.distance,
                similarity: result.similarity,
                chunkIndex: result.chunkIndex,
            };
        })
            .filter((chunk) => chunk !== null && chunk.chunkText.length > 0);
        if (validChunks.length === 0) {
            async function* emptyStream() {
                yield 'Unable to retrieve content from the knowledge base.';
            }
            return {
                stream: emptyStream(),
                sources: [],
            };
        }
        const contextText = validChunks
            .map((chunk, index) => `${chunk.title}]\n${chunk.chunkText}\n`)
            .join('\n---\n');
        const userPrompt = `Context from knowledge base: ${contextText}
      User Question: ${query}
      Please provide a concise but comprehensive answer based on the context above.
      Your answer must not be more than 200 words. Unless the user asked for length.
      You are not a chatbot, you are a search and information retrieval assistant.

      Reminder: answer in the same language as the "User Question" above. Default to ${defaultLanguage} if the question's language is unclear. Do not reply in English unless the question is in English.
      `;
        try {
            const stream = await this.aiService.generateCompletionStream({
                systemPrompt,
                userPrompt,
                temperature: 0.2,
                maxTokens: ai_constants_1.DEFAULT_AI_CONFIG.maxTokens,
                stream: true,
            });
            return {
                stream,
                sources: validChunks.map((chunk) => ({
                    pageId: chunk.pageId,
                    title: chunk.title,
                    slugId: chunk.slugId,
                    spaceSlug: chunk.spaceSlug,
                    similarity: chunk.similarity,
                    distance: chunk.distance,
                    chunkIndex: chunk.chunkIndex,
                    excerpt: chunk.chunkText.substring(0, 200) +
                        (chunk.chunkText.length > 200 ? '...' : ''),
                })),
            };
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate AI search response');
            throw new common_1.BadRequestException('Failed to generate AI search response. Please try again later.');
        }
    }
    async generatePageEmbeddings(pageId) {
        if (!this.aiService.isDriverConfigured())
            return;
        const page = await this.pageRepo.findById(pageId, {
            includeTextContent: true,
        });
        if (!page || page.deletedAt)
            return;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'settings'])
            .where('id', '=', page.workspaceId)
            .executeTakeFirst();
        const isAiSearchEnabled = workspace?.settings?.['ai']?.['search'] === true;
        if (!isAiSearchEnabled)
            return;
        if (!page?.textContent || page.textContent.length < 200)
            return;
        const pageText = this.preparePageText(page);
        const documents = await this.textSplitter.createDocuments([pageText], [{ pageId: page.id, title: page.title }]);
        this.logger.debug(`Split page ${page.id} into ${documents.length} chunks`);
        const embeddings = await this.aiService.generateEmbeddingsBatch(documents.map((doc) => doc.pageContent));
        const titlePrefixLength = page.title?.trim()
            ? `# ${page.title}\n\n`.length
            : 0;
        const embeddingsToStore = this.buildEmbeddingsToStore({
            documents,
            embeddings,
            page,
            pageText,
            titlePrefixLength,
        });
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.pageEmbeddingsRepo.deleteByPageId(page.id, { trx });
            await this.pageEmbeddingsRepo.insertPageEmbeddingBatch(embeddingsToStore, { trx });
            this.logger.debug(`Stored ${embeddingsToStore.length} embeddings for page ${page.id}`);
        });
    }
    preparePageText(page) {
        let text = page.textContent;
        if (page.title?.trim()) {
            text = `# ${page.title}\n\n${text}`;
        }
        const MAX_TEXT_LENGTH = 100000;
        if (text.length > MAX_TEXT_LENGTH) {
            this.logger.debug(`Page ${page.id} text truncated from ${text.length} to ${MAX_TEXT_LENGTH}`);
            text = text.substring(0, MAX_TEXT_LENGTH);
        }
        return text.replace(/\n{2,}/g, '\n\n');
    }
    buildEmbeddingsToStore(opts) {
        const { embeddings, documents, page, pageText, titlePrefixLength } = opts;
        let currentPosition = 0;
        return documents.map((doc, i) => {
            const chunkStartInModified = pageText.indexOf(doc.pageContent, currentPosition);
            const chunkLength = doc.pageContent.length;
            const chunkStart = Math.max(0, chunkStartInModified - titlePrefixLength);
            currentPosition = chunkStartInModified + chunkLength - 200;
            return {
                pageId: page.id,
                embedding: pgvector.toSql(embeddings[i]),
                modelName: this.environmentService.getAiEmbeddingModel(),
                chunkIndex: i,
                chunkStart,
                chunkLength,
                metadata: {
                    title: page.title,
                    totalChunks: documents.length,
                },
                spaceId: page.spaceId,
                workspaceId: page.workspaceId,
            };
        });
    }
};
exports.AiSearchService = AiSearchService;
exports.AiSearchService = AiSearchService = AiSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        environment_service_1.EnvironmentService,
        page_embeddings_repo_1.PageEmbeddingsRepo,
        page_repo_1.PageRepo,
        space_member_repo_1.SpaceMemberRepo,
        page_permission_repo_1.PagePermissionRepo, Object])
], AiSearchService);
//# sourceMappingURL=ai-search.service.js.map