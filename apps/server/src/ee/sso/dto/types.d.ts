import { Workspace } from "../../../database/types/entity.types";
import { SSO_PROVIDER } from "../constants";
export type GoogleProfile = {
    sub: string;
    name: string;
    email: string;
    hd?: string;
    photoUrl?: string;
    type?: SSO_PROVIDER.GOOGLE;
};
export type OidcProfile = {
    sub: string;
    name: string;
    email: string;
    type?: SSO_PROVIDER.OIDC;
    groups?: string[];
};
export type SamlProfile = {
    issuer: string;
    nameId: string;
    name: string;
    email: string;
    providerId: string;
    type?: SSO_PROVIDER.SAML;
    groups?: string[];
};
export type LdapProfile = {
    uid: string;
    name: string;
    email: string;
    providerId: string;
    type?: SSO_PROVIDER.LDAP;
    groups?: string[];
};
export interface HandleSsoOptions {
    workspace: Workspace;
    providerId: string;
    providerType: SSO_PROVIDER;
    profile: OidcProfile | SamlProfile | GoogleProfile | LdapProfile;
}
