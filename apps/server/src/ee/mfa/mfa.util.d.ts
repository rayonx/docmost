export declare enum MfaMethod {
    TOTP = "totp"
}
export declare function hashBackupCodes(codes: string[]): Promise<string[]>;
export declare function generateMfaSecret(): string;
export declare function encryptSecret(opts: {
    mfaSecret: string;
    appSecret: string;
}): string;
export declare function decryptSecret(opts: {
    mfaSecret: string;
    appSecret: string;
}): string;
export declare function generateBackupCodes(count?: number): string[];
export type MfaEnablement = {
    canEnable: true;
    secret: string;
} | {
    canEnable: false;
    reason: 'setup_not_initiated' | 'already_enabled';
};
export declare function resolveMfaEnablement(existingMfa: {
    secret?: string | null;
    isEnabled?: boolean | null;
} | null | undefined): MfaEnablement;
