import { OidcProfile, SamlProfile } from "./dto/types";
import { Profile as NodeSamlProfile } from '@node-saml/node-saml';
import { type UserInfoResponse } from 'openid-client';
export declare function generateRandomPassword(): string;
export declare function safeRedirectPath(input: unknown): string | null;
export declare function getObjectFromKeys<T = string>(object: any, keys: string[]): T | undefined;
export declare const getFirstObjectValue: (value: any) => any;
export declare function formatSamlProfile(profile: NodeSamlProfile, providerId: string): SamlProfile;
export declare function formatOidcProfile(userInfo: UserInfoResponse): OidcProfile;
export declare function diffSsoProvider(dto: Record<string, any>, providerBefore: Record<string, any>, providerAfter: Record<string, any>): {
    before: Record<string, any>;
    after: Record<string, any>;
} | null;
