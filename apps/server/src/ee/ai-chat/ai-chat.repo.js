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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const cursor_pagination_1 = require("../../database/pagination/cursor-pagination");
const CHAT_MESSAGE_COLUMNS = [
    'id',
    'chatId',
    'workspaceId',
    'userId',
    'role',
    'content',
    'toolCalls',
    'metadata',
    'createdAt',
    'updatedAt',
    'deletedAt',
];
let AiChatRepo = class AiChatRepo {
    constructor(db) {
        this.db = db;
    }
    async findChatById(chatId) {
        return this.db
            .selectFrom('aiChats')
            .selectAll()
            .where('id', '=', chatId)
            .executeTakeFirst();
    }
    async insertChat(chat) {
        return this.db
            .insertInto('aiChats')
            .values(chat)
            .returningAll()
            .executeTakeFirst();
    }
    async updateChatTitle(chatId, title) {
        await this.db
            .updateTable('aiChats')
            .set({ title, updatedAt: new Date() })
            .where('id', '=', chatId)
            .execute();
    }
    async deleteChat(chatId) {
        await this.db
            .deleteFrom('aiChats')
            .where('id', '=', chatId)
            .execute();
    }
    async findChatsByUser(workspaceId, userId, pagination) {
        const query = this.db
            .selectFrom('aiChats')
            .selectAll()
            .where('workspaceId', '=', workspaceId)
            .where('creatorId', '=', userId);
        return (0, cursor_pagination_1.executeWithCursorPagination)(query, {
            perPage: pagination.limit,
            cursor: pagination.cursor,
            fields: [{ expression: 'id', direction: 'desc' }],
            parseCursor: (cursor) => ({ id: cursor.id }),
        });
    }
    async searchChats(workspaceId, userId, query) {
        const trimmed = query.trim();
        if (!trimmed)
            return [];
        const ftsQuery = (0, kysely_1.sql) `websearch_to_tsquery('english', f_unaccent(${trimmed}))`;
        const likePattern = `%${trimmed}%`;
        const msgRank = (0, kysely_1.sql) `COALESCE(
      (
        SELECT MAX(ts_rank(tsv, ${ftsQuery}))
        FROM ai_chat_messages
        WHERE chat_id = ai_chats.id
          AND deleted_at IS NULL
          AND tsv @@ ${ftsQuery}
      ),
      0
    )`;
        const rows = await this.db
            .selectFrom('aiChats')
            .selectAll()
            .select(msgRank.as('msgRank'))
            .where('workspaceId', '=', workspaceId)
            .where('creatorId', '=', userId)
            .where((eb) => eb.or([
            (0, kysely_1.sql) `f_unaccent(coalesce(title, '')) ilike f_unaccent(${likePattern})`,
            (0, kysely_1.sql) `EXISTS (
            SELECT 1 FROM ai_chat_messages
            WHERE chat_id = ai_chats.id
              AND deleted_at IS NULL
              AND tsv @@ ${ftsQuery}
          )`,
        ]))
            .orderBy('msgRank', 'desc')
            .orderBy('updatedAt', 'desc')
            .limit(20)
            .execute();
        return rows.map(({ msgRank: _rank, ...chat }) => chat);
    }
    async findMessagesByChatId(chatId) {
        return this.db
            .selectFrom('aiChatMessages')
            .select(CHAT_MESSAGE_COLUMNS)
            .where('chatId', '=', chatId)
            .where('deletedAt', 'is', null)
            .orderBy('id', 'asc')
            .execute();
    }
    async insertMessage(message) {
        const result = await this.db
            .insertInto('aiChatMessages')
            .values(message)
            .returning(CHAT_MESSAGE_COLUMNS)
            .executeTakeFirst();
        await this.db
            .updateTable('aiChats')
            .set({ updatedAt: new Date() })
            .where('id', '=', message.chatId)
            .execute();
        return result;
    }
};
exports.AiChatRepo = AiChatRepo;
exports.AiChatRepo = AiChatRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], AiChatRepo);
//# sourceMappingURL=ai-chat.repo.js.map