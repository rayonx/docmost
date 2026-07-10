export declare class CreateApiKeyDto {
    name: string;
    expiresAt: string;
}
export declare class UpdateApiKeyDto {
    apiKeyId: string;
    name: string;
}
export declare class RevokeApiKeyDto {
    apiKeyId: string;
}
