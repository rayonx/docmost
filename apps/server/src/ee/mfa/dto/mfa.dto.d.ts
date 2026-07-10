export declare class EnableMfaDto {
    verificationCode: string;
}
export declare class MfaDto {
    code: string;
}
export declare class DisableMfaDto {
    confirmPassword?: string;
}
export declare class RegenerateBackupCodesDto {
    confirmPassword?: string;
}
export interface MfaLoginResult {
    userHasMfa: boolean;
    mfaToken?: string;
    authToken?: string;
    requiresMfaSetup?: boolean;
    isMfaEnforced?: boolean;
}
