import { Queue } from 'bullmq';
import { CommentRepo } from "../../database/repos/comment/comment.repo";
import { Comment, User } from "../../database/types/entity.types";
import { WsService } from '../../ws/ws.service';
import { CollaborationGateway } from '../../collaboration/collaboration.gateway';
export declare class CommentResolutionService {
    private commentRepo;
    private wsService;
    private collaborationGateway;
    private notificationQueue;
    private readonly logger;
    constructor(commentRepo: CommentRepo, wsService: WsService, collaborationGateway: CollaborationGateway, notificationQueue: Queue);
    resolveComment(comment: Comment, resolved: boolean, authUser: User, opts?: {
        updateYjsMark?: boolean;
    }): Promise<Comment>;
}
