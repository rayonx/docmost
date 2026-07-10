export declare class SendMessageDto {
    chatId?: string;
    content: string;
    mentionedPageIds?: string[];
    contextPageId?: string;
    attachmentIds?: string[];
}
export declare class ChatIdDto {
    chatId: string;
}
export declare class UpdateChatDto {
    chatId: string;
    title: string;
}
export declare class SearchChatsDto {
    query: string;
}
