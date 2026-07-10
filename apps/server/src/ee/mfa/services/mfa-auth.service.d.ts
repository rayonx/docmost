import { FastifyRequest } from 'fastify';
import { TokenService } from '../../../core/auth/services/token.service';
import { UserRepo } from "../../../database/repos/user/user.repo";
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
import { User, Workspace } from "../../../database/types/entity.types";
export interface MfaAuthResult {
    user: User;
    workspace: Workspace;
    isTransferToken: boolean;
}
export declare class MfaAuthService {
    private readonly tokenService;
    private readonly userRepo;
    private readonly workspaceRepo;
    constructor(tokenService: TokenService, userRepo: UserRepo, workspaceRepo: WorkspaceRepo);
    authenticateRequest(req: FastifyRequest): Promise<MfaAuthResult>;
    private validatePayloadAndGetUserWorkspace;
}
