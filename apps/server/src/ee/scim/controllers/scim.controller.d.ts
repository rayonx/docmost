import { Workspace } from "../../../database/types/entity.types";
import { CreateScimUserDto, PatchScimUserDto, UpdateScimUserDto } from "../dto/scim-user.dto";
import { CreateScimGroupDto, PatchScimGroupDto, UpdateScimGroupDto } from "../dto/scim-group.dto";
import SCIMMY from 'scimmy';
import { ScimUserService } from "../services/scim-user.service";
import { FastifyReply } from 'fastify';
import { ScimQueryDto } from "../dto/scim-query.dto";
import { ScimGroupService } from "../services/scim-group.service";
export declare class ScimController {
    private readonly scimUserService;
    private readonly scimGroupService;
    constructor(scimUserService: ScimUserService, scimGroupService: ScimGroupService);
    getSchemas(): Promise<SCIMMY.Messages.ListResponse<any> | SCIMMY.Types.SchemaDefinition.SchemaDescription>;
    getSchema(schemaId: string, res: FastifyReply): Promise<void>;
    getServiceProviderConfig(): Promise<SCIMMY.Messages.ListResponse<any> | SCIMMY.Schemas.ServiceProviderConfig>;
    getResourceTypes(): Promise<SCIMMY.Messages.ListResponse<any> | SCIMMY.Schemas.ResourceType>;
    getResourceType(resourceTypeId: string, res: FastifyReply): Promise<void>;
    getUser(workspace: Workspace, userId: string, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    getUsers(workspace: Workspace, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    createUser(workspace: Workspace, dto: CreateScimUserDto, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    updateUser(workspace: Workspace, userId: string, dto: UpdateScimUserDto, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    updateUserPatch(workspace: Workspace, userId: string, dto: PatchScimUserDto, res: FastifyReply): Promise<void>;
    deleteUser(workspace: Workspace, userId: string, res: FastifyReply): Promise<void>;
    getGroup(workspace: Workspace, groupId: string, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    getGroups(workspace: Workspace, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    createGroup(workspace: Workspace, dto: CreateScimGroupDto, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    updateGroup(workspace: Workspace, groupId: string, dto: UpdateScimGroupDto, query: ScimQueryDto, res: FastifyReply): Promise<void>;
    updateGroupPatch(workspace: Workspace, groupId: string, dto: PatchScimGroupDto, res: FastifyReply): Promise<void>;
    deleteGroup(workspace: Workspace, groupId: string, res: FastifyReply): Promise<void>;
    handleScimError(res: FastifyReply, err: unknown): void;
    buildScimQueryOptions(query: {
        startIndex?: string | number;
        sortBy?: string;
        count?: string | number;
        filter?: string;
    }): any;
}
