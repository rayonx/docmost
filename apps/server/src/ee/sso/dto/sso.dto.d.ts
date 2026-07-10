import { SSO_PROVIDER } from "../constants";
export declare class CreateSsoProviderDto {
    name: string;
    type: SSO_PROVIDER.SAML | SSO_PROVIDER.OIDC | SSO_PROVIDER.GOOGLE | SSO_PROVIDER.LDAP;
    samlUrl: string;
    samlCertificate: string;
    oidcIssuer: string;
    oidcClientId: string;
    oidcClientSecret: string;
    ldapUrl: string;
    ldapBindDn: string;
    ldapBindPassword: string;
    ldapBaseDn: string;
    ldapUserSearchFilter: string;
    ldapUserAttributes: any;
    ldapTlsEnabled: boolean;
    ldapTlsCaCert: string;
    allowSignup: boolean;
    isEnabled: boolean;
    groupSync: boolean;
}
export declare class SsoProviderIdDto {
    providerId: string;
}
export declare class UpdateSsoProviderDto extends SsoProviderIdDto {
    name: string;
    samlUrl: string;
    samlCertificate: string;
    oidcIssuer: string;
    oidcClientId: string;
    oidcClientSecret: string;
    ldapUrl: string;
    ldapBindDn: string;
    ldapBindPassword: string;
    ldapBaseDn: string;
    ldapUserSearchFilter: string;
    ldapUserAttributes: any;
    ldapTlsEnabled: boolean;
    ldapTlsCaCert: string;
    allowSignup: boolean;
    isEnabled: boolean;
    groupSync: boolean;
}
