export type LicenseType = 'business' | 'enterprise';
export interface LicensePayload {
    licenseId: string;
    seats: number;
    licenseType: LicenseType;
    trial: boolean;
    issuedAt: Date;
    expiresAt: Date;
    customer: {
        id: string;
        name: string;
        email: string;
    };
    version: string;
}
export interface LicenseInfo {
    id: string;
    customerName: string;
    seatCount: number;
    licenseType: LicenseType;
    issuedAt: Date;
    expiresAt: Date;
    trial: boolean;
}
