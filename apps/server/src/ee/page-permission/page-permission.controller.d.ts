import { PagePermissionService } from './page-permission.service';
import { AddPagePermissionDto, PageIdDto, RemovePagePermissionDto, RemovePageRestrictionDto, RestrictPageDto, UpdatePagePermissionRoleDto } from './dto/page-permission.dto';
import { PaginationOptions } from "../../database/pagination/pagination-options";
import { User, Workspace } from "../../database/types/entity.types";
export declare class PagePermissionController {
    private readonly pagePermissionService;
    constructor(pagePermissionService: PagePermissionService);
    restrictPage(dto: RestrictPageDto, user: User, workspace: Workspace): Promise<void>;
    removePageRestriction(dto: RemovePageRestrictionDto, user: User): Promise<void>;
    addPagePermission(dto: AddPagePermissionDto, user: User, workspace: Workspace): Promise<void>;
    removePagePermissions(dto: RemovePagePermissionDto, user: User): Promise<void>;
    updatePagePermissionRole(dto: UpdatePagePermissionRoleDto, user: User): Promise<void>;
    getPagePermissions(dto: PageIdDto, pagination: PaginationOptions, user: User): Promise<import("../../database/pagination/cursor-pagination").CursorPaginationResult<import("../../database/repos/page/page-permission.repo").PagePermissionMember>>;
    getPageRestrictionInfo(dto: PageIdDto, user: User): Promise<import("./page-permission.service").PageRestrictionInfo>;
}
