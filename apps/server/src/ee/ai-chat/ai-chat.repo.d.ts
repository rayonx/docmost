import { KyselyDB } from "../../database/types/kysely.types";
import { AiChat, AiChatMessage, InsertableAiChat, InsertableAiChatMessage } from "../../database/types/entity.types";
import { PaginationOptions } from "../../database/pagination/pagination-options";
export declare class AiChatRepo {
    private readonly db;
    constructor(db: KyselyDB);
    findChatById(chatId: string): Promise<AiChat | undefined>;
    insertChat(chat: InsertableAiChat): Promise<AiChat>;
    updateChatTitle(chatId: string, title: string): Promise<void>;
    deleteChat(chatId: string): Promise<void>;
    findChatsByUser(workspaceId: string, userId: string, pagination: PaginationOptions): Promise<import("@docmost/db/pagination/cursor-pagination").CursorPaginationResult<{
        id: string;
        workspaceId: string;
        creatorId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }, undefined>>;
    searchChats(workspaceId: string, userId: string, query: string): Promise<AiChat[]>;
    findMessagesByChatId(chatId: string): Promise<AiChatMessage[]>;
    insertMessage(message: InsertableAiChatMessage): Promise<AiChatMessage>;
}
