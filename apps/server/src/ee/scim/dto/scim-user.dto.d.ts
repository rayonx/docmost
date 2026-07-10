import { ScimPatchOperationDto } from "./scim.dto";
export declare class ScimUserNameDto {
    givenName: string;
    familyName: string;
}
export declare class CreateScimUserDto {
    schemas: string[];
    userName: string;
    name: ScimUserNameDto;
    externalId: string;
    locale: string;
    groups?: string[];
    active: boolean;
}
export declare class UpdateScimUserDto extends CreateScimUserDto {
}
export declare class PatchScimUserDto {
    schemas: any[];
    Operations: ScimPatchOperationDto[];
}
