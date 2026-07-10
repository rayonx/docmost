import { CommentResolutionService } from './comment-resolution.service';
import { ResolveCommentDto } from './dto/resolve-comment.dto';
import { User, Workspace } from "../../database/types/entity.types";
import { PageRepo } from "../../database/repos/page/page.repo";
import { CommentRepo } from "../../database/repos/comment/comment.repo";
import { PageAccessService } from '../../core/page/page-access/page-access.service';
export declare class CommentResolutionController {
    private readonly commentResolutionService;
    private readonly commentRepo;
    private readonly pageRepo;
    private readonly pageAccessService;
    constructor(commentResolutionService: CommentResolutionService, commentRepo: CommentRepo, pageRepo: PageRepo, pageAccessService: PageAccessService);
    resolveComment(resolveCommentDto: ResolveCommentDto, user: User, workspace: Workspace): Promise<{
        type: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        content: import("../../database/types/db").JsonValue;
        spaceId: string;
        pageId: string;
        editedAt: Date;
        lastEditedById: string;
        parentCommentId: string;
        resolvedAt: Date;
        resolvedById: string;
        selection: string;
    }>;
}
