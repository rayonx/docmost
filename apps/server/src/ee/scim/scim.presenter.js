"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presentScimUser = presentScimUser;
exports.presentScimGroup = presentScimGroup;
const scimmy_1 = require("scimmy");
function presentScimUser(user) {
    const locale = user.locale || 'en-US';
    return new scimmy_1.default.Schemas.User({
        id: user.id,
        externalId: user.scimExternalId ?? undefined,
        userName: user.email,
        displayName: user.name,
        name: {
            formatted: user.name,
        },
        active: !user.deactivatedAt,
        locale,
        emails: [
            {
                value: user.email,
                primary: true,
                type: "work"
            },
        ],
        meta: {
            resourceType: "User",
            created: user.createdAt,
            lastModified: user.updatedAt
        }
    });
}
function presentScimGroup(group, users) {
    return new scimmy_1.default.Schemas.Group({
        id: group.id,
        externalId: group.scimExternalId ?? undefined,
        displayName: group.name,
        members: users?.map((user) => ({
            value: user.id,
            display: user.email,
        })) ?? [],
        meta: {
            resourceType: 'Group',
            created: group.createdAt,
            lastModified: group.updatedAt,
        },
    });
}
//# sourceMappingURL=scim.presenter.js.map