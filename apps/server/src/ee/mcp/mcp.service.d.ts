import { IncomingMessage, ServerResponse } from 'node:http';
import { User, Workspace } from "../../database/types/entity.types";
import { McpToolsService } from './mcp-tools.service';
export declare class McpService {
    private readonly mcpToolsService;
    constructor(mcpToolsService: McpToolsService);
    handlePost(req: IncomingMessage, res: ServerResponse, body: unknown, user: User, workspace: Workspace): Promise<void>;
    private createMcpServer;
}
