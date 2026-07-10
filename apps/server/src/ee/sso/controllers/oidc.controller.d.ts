import { FastifyReply, FastifyRequest } from 'fastify';
import { Workspace } from "../../../database/types/entity.types";
import { OidcService } from "../services/oidc.service";
import { SsoService } from "../services/sso.service";
export declare class OidcController {
    private readonly oidcService;
    private readonly ssoService;
    constructor(oidcService: OidcService, ssoService: SsoService);
    oidcLogin(workspace: Workspace, req: FastifyRequest, res: FastifyReply): Promise<void>;
    callback(workspace: Workspace, req: FastifyRequest, res: FastifyReply): Promise<void>;
}
