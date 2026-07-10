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
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpToolsService = void 0;
const common_1 = require("@nestjs/common");
const page_service_1 = require("../../core/page/services/page.service");
const page_repo_1 = require("../../database/repos/page/page.repo");
const page_access_service_1 = require("../../core/page/page-access/page-access.service");
const space_service_1 = require("../../core/space/services/space.service");
const space_member_service_1 = require("../../core/space/services/space-member.service");
const comment_service_1 = require("../../core/comment/comment.service");
const search_service_1 = require("../../core/search/search.service");
const workspace_service_1 = require("../../core/workspace/services/workspace.service");
const space_ability_factory_1 = require("../../core/casl/abilities/space-ability.factory");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const environment_service_1 = require("../../integrations/environment/environment.service");
const core_1 = require("@nestjs/core");
const page_tools_1 = require("./tools/page.tools");
const space_tools_1 = require("./tools/space.tools");
const comment_tools_1 = require("./tools/comment.tools");
const attachment_tools_1 = require("./tools/attachment.tools");
const user_tools_1 = require("./tools/user.tools");
const workspace_tools_1 = require("./tools/workspace.tools");
let McpToolsService = class McpToolsService {
    constructor(pageRepo, pageService, pageAccessService, spaceService, spaceMemberService, commentService, searchService, workspaceService, spaceAbility, workspaceAbility, environmentService, moduleRef) {
        this.pageRepo = pageRepo;
        this.pageService = pageService;
        this.pageAccessService = pageAccessService;
        this.spaceService = spaceService;
        this.spaceMemberService = spaceMemberService;
        this.commentService = commentService;
        this.searchService = searchService;
        this.workspaceService = workspaceService;
        this.spaceAbility = spaceAbility;
        this.workspaceAbility = workspaceAbility;
        this.environmentService = environmentService;
        this.moduleRef = moduleRef;
    }
    registerTools(server, user, workspace) {
        const deps = {
            pageRepo: this.pageRepo,
            pageService: this.pageService,
            pageAccessService: this.pageAccessService,
            spaceService: this.spaceService,
            spaceMemberService: this.spaceMemberService,
            commentService: this.commentService,
            searchService: this.searchService,
            workspaceService: this.workspaceService,
            spaceAbility: this.spaceAbility,
            workspaceAbility: this.workspaceAbility,
            environmentService: this.environmentService,
            moduleRef: this.moduleRef,
        };
        const ctx = { server, user, workspace };
        (0, page_tools_1.registerPageTools)(ctx, deps);
        (0, space_tools_1.registerSpaceTools)(ctx, deps);
        (0, comment_tools_1.registerCommentTools)(ctx, deps);
        (0, attachment_tools_1.registerAttachmentTools)(ctx, deps);
        (0, workspace_tools_1.registerWorkspaceTools)(ctx, deps);
        (0, user_tools_1.registerUserTools)(ctx);
    }
};
exports.McpToolsService = McpToolsService;
exports.McpToolsService = McpToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [page_repo_1.PageRepo,
        page_service_1.PageService,
        page_access_service_1.PageAccessService,
        space_service_1.SpaceService,
        space_member_service_1.SpaceMemberService,
        comment_service_1.CommentService,
        search_service_1.SearchService,
        workspace_service_1.WorkspaceService,
        space_ability_factory_1.default,
        workspace_ability_factory_1.default,
        environment_service_1.EnvironmentService,
        core_1.ModuleRef])
], McpToolsService);
//# sourceMappingURL=mcp-tools.service.js.map