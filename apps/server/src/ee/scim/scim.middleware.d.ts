import { NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DomainService } from '../../integrations/environment/domain.service';
export declare class ScimMiddleware implements NestMiddleware {
    private readonly domainService;
    constructor(domainService: DomainService);
    use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void): void;
}
