import { FastifyReply } from 'fastify';
import { User, Workspace } from "../../database/types/entity.types";
import { AiChatService } from './ai-chat.service';
import { AiChatRepo } from './ai-chat.repo';
import { SendMessageDto, ChatIdDto, UpdateChatDto, SearchChatsDto } from './dto/ai-chat.dto';
import { PaginationOptions } from "../../database/pagination/pagination-options";
import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class AiChatController {
    private readonly chatService;
    private readonly chatRepo;
    private readonly environmentService;
    constructor(chatService: AiChatService, chatRepo: AiChatRepo, environmentService: EnvironmentService);
    createChat(user: User, workspace: Workspace): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    listChats(pagination: PaginationOptions, user: User, workspace: Workspace): Promise<import("../../database/pagination/cursor-pagination").CursorPaginationResult<{
        id: string;
        workspaceId: string;
        creatorId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }, undefined>>;
    getChatInfo(dto: ChatIdDto, user: User, workspace: Workspace): Promise<{
        chat: import("@docmost/db/types/entity.types").AiChat;
        messages: import("@docmost/db/types/entity.types").AiChatMessage[];
    }>;
    deleteChat(dto: ChatIdDto, user: User, workspace: Workspace): Promise<void>;
    updateChat(dto: UpdateChatDto, user: User, workspace: Workspace): Promise<void>;
    searchChats(dto: SearchChatsDto, user: User, workspace: Workspace): Promise<{
        id: string;
        workspaceId: string;
        creatorId: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }[]>;
    sendMessage(dto: SendMessageDto, user: User, workspace: Workspace, req: any, reply: FastifyReply): Promise<void>;
    uploadFile(req: any, res: FastifyReply, user: User, workspace: Workspace): Promise<never>;
}
