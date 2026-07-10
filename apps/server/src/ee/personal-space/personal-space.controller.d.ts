import { User, Workspace } from "../../database/types/entity.types";
import { PersonalSpaceService } from './services/personal-space.service';
import { CreatePersonalSpaceDto } from './dto/create-personal-space.dto';
export declare class PersonalSpaceController {
    private readonly personalSpaceService;
    constructor(personalSpaceService: PersonalSpaceService);
    getMyPersonalSpace(user: User, workspace: Workspace): Promise<{
        description: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        defaultRole: string;
        logo: string;
        name: string;
        settings: import("../../database/types/db").JsonValue;
        isPersonal: boolean;
        slug: string;
        visibility: string;
    }>;
    createPersonalSpace(dto: CreatePersonalSpaceDto, user: User, workspace: Workspace): Promise<{
        description: string;
        id: string;
        workspaceId: string;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        defaultRole: string;
        logo: string;
        name: string;
        settings: import("../../database/types/db").JsonValue;
        isPersonal: boolean;
        slug: string;
        visibility: string;
    }>;
}
