import { FastifyReply, FastifyRequest } from 'fastify';
import { User, Workspace } from "../../database/types/entity.types";
import { McpService } from './mcp.service';
export declare class McpController {
    private readonly mcpService;
    constructor(mcpService: McpService);
    handlePost(req: FastifyRequest, reply: FastifyReply, user: User, workspace: Workspace): Promise<void>;
    private assertMcpEnabled;
}
