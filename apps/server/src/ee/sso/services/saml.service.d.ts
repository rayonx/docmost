import { SsoService } from "./sso.service";
import { SessionService } from '../../../core/session/session.service';
import { FastifyRequest } from 'fastify';
import { Workspace } from "../../../database/types/entity.types";
import { RedisService } from '@nestjs-labs/nestjs-ioredis';
export declare class SamlService {
    private readonly ssoService;
    private readonly sessionService;
    private readonly redisService;
    private readonly logger;
    constructor(ssoService: SsoService, sessionService: SessionService, redisService: RedisService);
    handleCallback(opts: {
        req: FastifyRequest;
        workspace: Workspace;
        providerId: string;
    }): Promise<string>;
    private rejectReplayedResponse;
}
