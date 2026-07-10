"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LdapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapService = void 0;
const common_1 = require("@nestjs/common");
const sso_service_1 = require("./sso.service");
const constants_1 = require("../constants");
const ldap_escape_1 = require("../utils/ldap-escape");
const ldapts_1 = require("ldapts");
const sso_utils_1 = require("../sso.utils");
let LdapService = LdapService_1 = class LdapService {
    constructor(ssoService) {
        this.ssoService = ssoService;
        this.logger = new common_1.Logger(LdapService_1.name);
    }
    async authenticate(opts) {
        const { username, password, workspace, providerId } = opts;
        const provider = await this.ssoService.getProviderById({
            providerId,
            workspaceId: workspace.id,
            type: constants_1.SSO_PROVIDER.LDAP,
        });
        if (!provider) {
            throw new common_1.BadRequestException('LDAP provider not found');
        }
        if (!provider.isEnabled) {
            throw new common_1.BadRequestException('LDAP provider is not enabled');
        }
        const userAttributes = await this.authenticateUser({
            username,
            password,
            provider,
        });
        const ldapProfile = this.formatLdapProfile(userAttributes, providerId, provider.groupSync);
        let user;
        try {
            user = await this.ssoService.handleAuthentication({
                workspace,
                profile: ldapProfile,
                providerId,
                providerType: constants_1.SSO_PROVIDER.LDAP,
            });
        }
        catch (err) {
            this.logger.error({ err }, 'LDAP authentication error');
            throw err;
        }
        return user;
    }
    async authenticateUser(opts) {
        const { username, password, provider } = opts;
        const tlsOptions = provider.ldapTlsEnabled
            ? {
                ca: provider.ldapTlsCaCert || undefined,
                rejectUnauthorized: true,
            }
            : undefined;
        const client = new ldapts_1.Client({
            url: provider.ldapUrl,
            timeout: 5000,
            connectTimeout: 5000,
            tlsOptions,
        });
        try {
            await client.bind(provider.ldapBindDn, provider.ldapBindPassword);
            const escapedUsername = (0, ldap_escape_1.escapeFilter)(username);
            let searchFilter = provider.ldapUserSearchFilter || `(uid=${escapedUsername})`;
            if (provider.ldapUserSearchFilter) {
                if (!provider.ldapUserSearchFilter.includes('{{username}}')) {
                    this.logger.warn(`LDAP user search filter does not contain {{username}} placeholder: ${provider.ldapUserSearchFilter}`);
                    searchFilter = `(uid=${escapedUsername})`;
                }
                else {
                    searchFilter = provider.ldapUserSearchFilter.replace('{{username}}', escapedUsername);
                }
            }
            this.logger.debug({ searchFilter }, 'LDAP search filter');
            let searchAttributes = [
                'uid',
                'mail',
                'cn',
                'displayName',
                'givenName',
                'sn',
                'sAMAccountName',
                'userPrincipalName',
                'distinguishedName',
                'memberOf',
                'groups',
            ];
            if (provider.ldapUserAttributes) {
                try {
                    const customAttributes = provider.ldapUserAttributes;
                    if (Array.isArray(customAttributes)) {
                        searchAttributes = [...searchAttributes, ...customAttributes];
                    }
                    else if (customAttributes?.attributes) {
                        searchAttributes = [
                            ...searchAttributes,
                            ...customAttributes.attributes,
                        ];
                    }
                }
                catch (err) {
                    this.logger.warn({ err }, 'Failed to parse LDAP user attributes');
                }
            }
            const searchResult = await client.search(provider.ldapBaseDn, {
                filter: searchFilter,
                scope: 'sub',
                attributes: searchAttributes,
            });
            this.logger.debug({ searchResult }, 'LDAP user search result');
            if (!searchResult.searchEntries ||
                searchResult.searchEntries.length === 0) {
                throw new common_1.BadRequestException('Invalid LDAP username or password');
            }
            const userEntry = searchResult.searchEntries[0];
            const userDn = userEntry.dn;
            await client.unbind();
            const userClient = new ldapts_1.Client({
                url: provider.ldapUrl,
                timeout: 5000,
                connectTimeout: 5000,
                tlsOptions,
            });
            try {
                await userClient.bind(userDn, password);
                await userClient.unbind();
            }
            catch (err) {
                this.logger.debug({ err }, 'LDAP user bind failed');
                throw new common_1.BadRequestException('Invalid LDAP username or password');
            }
            const userAttributes = {};
            for (const [key, value] of Object.entries(userEntry)) {
                if (key !== 'dn') {
                    userAttributes[key] =
                        Array.isArray(value) && value.length === 1 ? value[0] : value;
                }
            }
            this.logger.debug({ userAttributes }, 'LDAP user attributes');
            return userAttributes;
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            if (err?.['message']?.includes('bind') ||
                err?.['code'] === 'LDAP_INVALID_CREDENTIALS') {
                this.logger.error({ err }, 'LDAP bind credentials failed');
                throw new common_1.BadRequestException('LDAP server bind credentials are invalid');
            }
            this.logger.error({ err }, 'LDAP authentication failed');
            throw new common_1.BadRequestException('LDAP authentication failed');
        }
        finally {
            try {
                await client.unbind();
            }
            catch (e) {
            }
        }
    }
    formatLdapProfile(userAttributes, providerId, groupSyncEnabled = false) {
        const uid = (0, sso_utils_1.getFirstObjectValue)(userAttributes.uid) ||
            (0, sso_utils_1.getFirstObjectValue)(userAttributes.sAMAccountName) ||
            (0, sso_utils_1.getFirstObjectValue)(userAttributes.userPrincipalName) ||
            (0, sso_utils_1.getFirstObjectValue)(userAttributes.cn);
        const mailValue = Array.isArray(userAttributes?.mail)
            ? userAttributes.mail[0]
            : userAttributes?.mail;
        const email = mailValue?.toLowerCase();
        const name = userAttributes.displayName ||
            userAttributes.cn ||
            `${userAttributes.givenName || ''} ${userAttributes.sn || ''}`.trim() ||
            email;
        let groups = [];
        if (groupSyncEnabled) {
            const memberOf = userAttributes.memberOf || userAttributes.groups;
            if (memberOf) {
                if (Array.isArray(memberOf)) {
                    groups = memberOf
                        .map((dn) => {
                        const match = dn.match(/^CN=([^,]+)/i);
                        return match ? match[1] : dn;
                    })
                        .filter(Boolean);
                }
                else if (typeof memberOf === 'string') {
                    const match = memberOf.match(/^CN=([^,]+)/i);
                    groups = match ? [match[1]] : [memberOf];
                }
            }
            this.logger.debug({ groups }, 'LDAP groups extracted');
        }
        const profile = {
            uid,
            email,
            name,
            providerId,
            type: constants_1.SSO_PROVIDER.LDAP,
            groups: groupSyncEnabled ? groups : undefined,
        };
        if (!profile.email) {
            throw new common_1.BadRequestException('LDAP account email is missing');
        }
        if (!profile.uid) {
            throw new common_1.BadRequestException('LDAP account uid is missing');
        }
        return profile;
    }
};
exports.LdapService = LdapService;
exports.LdapService = LdapService = LdapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sso_service_1.SsoService])
], LdapService);
//# sourceMappingURL=ldap.service.js.map