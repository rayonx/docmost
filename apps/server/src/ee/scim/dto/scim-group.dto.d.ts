import { ScimPatchOperationDto } from './scim.dto';
export declare class ScimGroupMemberDto {
    value: string;
    display?: string;
    type?: string;
    ref?: string;
}
export declare class CreateScimGroupDto {
    schemas: string[];
    displayName: string;
    members: ScimGroupMemberDto[];
}
export declare class UpdateScimGroupDto extends CreateScimGroupDto {
}
export declare class PatchScimGroupDto {
    schemas: any[];
    Operations: ScimPatchOperationDto[];
}
