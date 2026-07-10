import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { FastifyReply } from 'fastify';
import { Workspace } from "../../../database/types/entity.types";
import { ExchangeService } from "../services/exchange.service";
export declare class ExchangeController {
    private readonly exchangeService;
    private readonly environmentService;
    constructor(exchangeService: ExchangeService, environmentService: EnvironmentService);
    exchange(res: FastifyReply, workspace: Workspace, exchangeToken: string, redirect: string): Promise<void>;
}
