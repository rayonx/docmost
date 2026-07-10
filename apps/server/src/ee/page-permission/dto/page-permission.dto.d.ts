export declare class PageIdDto {
    pageId: string;
}
export declare class RestrictPageDto extends PageIdDto {
}
export declare class AddPagePermissionDto extends PageIdDto {
    role: string;
    userIds?: string[];
    groupIds?: string[];
}
export declare class RemovePagePermissionDto extends PageIdDto {
    userIds?: string[];
    groupIds?: string[];
}
export declare class UpdatePagePermissionRoleDto extends PageIdDto {
    role: string;
    userId?: string;
    groupId?: string;
}
export declare class RemovePageRestrictionDto extends PageIdDto {
}
