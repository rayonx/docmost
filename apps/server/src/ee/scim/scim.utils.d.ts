interface ScimUser {
    name: string;
    email: string;
    active: boolean;
}
export declare function formatScimUser(data: any): ScimUser;
export declare function hashScimToken(rawToken: string, appSecret: string): string;
export declare function generateRawScimToken(): string;
export declare function throwScimError(status: number, detail: string, scimType?: string): never;
export {};
