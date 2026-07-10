import { Group, User } from "../../database/types/entity.types";
import SCIMMY from 'scimmy';
export declare function presentScimUser(user: Partial<User>): SCIMMY.Schemas.User;
export declare function presentScimGroup(group: Partial<Group>, users?: {
    id: string;
    email: string;
}[]): SCIMMY.Schemas.Group;
