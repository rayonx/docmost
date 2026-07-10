import { FastifyRequest } from 'fastify';
import { SsoService } from "../services/sso.service";
import { Profile } from '@node-saml/node-saml';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
declare const SamlStrategy_base: new (...args: unknown[]) => any;
export declare class SamlStrategy extends SamlStrategy_base {
    private readonly logger;
    constructor(ssoService: SsoService, environmentService: EnvironmentService);
    validate(req: FastifyRequest, profile: Profile, done: any): Promise<void>;
}
export {};
