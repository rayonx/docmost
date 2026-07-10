import { FastifyReply } from 'fastify';
import { User, Workspace } from "../../../database/types/entity.types";
import { AiSearchService } from "../services/ai-search.service";
import { SearchDTO } from '../../../core/search/dto/search.dto';
import SpaceAbilityFactory from '../../../core/casl/abilities/space-ability.factory';
import { AiGenerateDto } from '../dto/ai-content.dto';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { AiService } from '../services/ai.service';
export declare class AiContentController {
    private readonly vectorService;
    private readonly spaceAbility;
    private readonly environmentService;
    private readonly aiService;
    constructor(vectorService: AiSearchService, spaceAbility: SpaceAbilityFactory, environmentService: EnvironmentService, aiService: AiService);
    ragSearch(searchDto: SearchDTO, user: User, workspace: Workspace, reply: FastifyReply): Promise<void>;
    generateStream(dto: AiGenerateDto, user: User, workspace: Workspace, reply: FastifyReply): Promise<void>;
}
