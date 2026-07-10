import { FastifyReply, FastifyRequest } from 'fastify';
import { DomainService } from '../../../integrations/environment/domain.service';
import { GoogleSsoService } from "../services/google-sso.service";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { SsoService } from "../services/sso.service";
export declare class GoogleController {
    private readonly googleSsoService;
    private readonly domainService;
    private readonly environmentService;
    private readonly ssoService;
    constructor(googleSsoService: GoogleSsoService, domainService: DomainService, environmentService: EnvironmentService, ssoService: SsoService);
    googleLogin(): Promise<void>;
    googleSignup(): Promise<void>;
    callback(req: FastifyRequest, res: FastifyReply): Promise<void>;
}
