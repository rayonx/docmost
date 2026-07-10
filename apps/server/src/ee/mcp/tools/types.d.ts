import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PageService } from '../../../core/page/services/page.service';
import { PageRepo } from "../../../database/repos/page/page.repo";
import { PageAccessService } from '../../../core/page/page-access/page-access.service';
import { SpaceService } from '../../../core/space/services/space.service';
import { SpaceMemberService } from '../../../core/space/services/space-member.service';
import { CommentService } from '../../../core/comment/comment.service';
import { SearchService } from '../../../core/search/search.service';
import { WorkspaceService } from '../../../core/workspace/services/workspace.service';
import SpaceAbilityFactory from '../../../core/casl/abilities/space-ability.factory';
import WorkspaceAbilityFactory from '../../../core/casl/abilities/workspace-ability.factory';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { ModuleRef } from '@nestjs/core';
import { User, Workspace } from "../../../database/types/entity.types";
export type McpToolDeps = {
    pageRepo: PageRepo;
    pageService: PageService;
    pageAccessService: PageAccessService;
    spaceService: SpaceService;
    spaceMemberService: SpaceMemberService;
    commentService: CommentService;
    searchService: SearchService;
    workspaceService: WorkspaceService;
    spaceAbility: SpaceAbilityFactory;
    workspaceAbility: WorkspaceAbilityFactory;
    environmentService: EnvironmentService;
    moduleRef: ModuleRef;
};
export type McpToolContext = {
    server: McpServer;
    user: User;
    workspace: Workspace;
};
export type McpToolResult = {
    content: {
        type: 'text';
        text: string;
    }[];
    isError?: boolean;
};
export declare function mcpError(text: string): McpToolResult;
export declare function mcpResult(data: unknown): McpToolResult;
export declare function validatePageInWorkspace(page: {
    workspaceId: string;
    deletedAt?: Date | null;
} | null, workspaceId: string): boolean;
