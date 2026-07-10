import { SsoService } from "./sso.service";
import { Configuration } from 'openid-client';
import { Workspace } from "../../../database/types/entity.types";
import { FastifyReply, FastifyRequest } from 'fastify';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { OidcProfile } from "../dto/types";
import { SessionService } from '../../../core/session/session.service';
export declare class OidcService {
    private readonly ssoService;
    private readonly environmentService;
    private readonly sessionService;
    private readonly logger;
    constructor(ssoService: SsoService, environmentService: EnvironmentService, sessionService: SessionService);
    handleCallback(opts: {
        req: FastifyRequest;
        res: FastifyReply;
        workspace: Workspace;
        providerId: string;
    }): Promise<string>;
    validate(opts: {
        req: FastifyRequest;
        res: FastifyReply;
        workspace: Workspace;
        providerId: string;
    }): Promise<OidcProfile>;
    getAuthorizationUrl(opts: {
        res: FastifyReply;
        providerId: string;
        workspace: Workspace;
    }): Promise<string>;
    getClient(opts: {
        providerId: string;
        workspace: Workspace;
    }): Promise<Configuration>;
}
