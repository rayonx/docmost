import { FastifyReply, FastifyRequest } from 'fastify';
import { SsoService } from "../services/sso.service";
import { Workspace } from "../../../database/types/entity.types";
import { SamlService } from "../services/saml.service";
export declare class SamlController {
    private readonly samlService;
    private readonly ssoService;
    constructor(samlService: SamlService, ssoService: SsoService);
    samlLogin(): Promise<void>;
    callback(workspace: Workspace, req: FastifyRequest, res: FastifyReply): Promise<void>;
    getMetadata(req: FastifyRequest, workspace: Workspace): Promise<string>;
}
