import { Profile } from 'passport';
import { FastifyRequest } from 'fastify';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
declare const GoogleStrategy_base: new (...args: unknown[]) => any;
export declare class GoogleStrategy extends GoogleStrategy_base {
    constructor(environmentService: EnvironmentService);
    authenticate(req: any, options: any): any;
    validate(req: FastifyRequest, accessToken: string, refreshToken: string, profile: Profile, done: any): Promise<void>;
}
export {};
