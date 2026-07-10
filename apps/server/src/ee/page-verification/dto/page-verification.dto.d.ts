export declare enum VerificationType {
    EXPIRING = "expiring",
    QMS = "qms"
}
export declare enum QmsStatus {
    DRAFT = "draft",
    IN_APPROVAL = "in_approval",
    APPROVED = "approved",
    OBSOLETE = "obsolete"
}
export declare enum ExpirationMode {
    PERIOD = "period",
    FIXED = "fixed",
    INDEFINITE = "indefinite"
}
export declare enum PeriodUnit {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year"
}
export declare const PERIOD_UNIT_DAYS: Record<PeriodUnit, number>;
export declare const PERIOD_AMOUNT_MIN = 1;
export declare const PERIOD_UNIT_MAX_AMOUNT: Record<PeriodUnit, number>;
export declare const PERIOD_AMOUNT_ABSOLUTE_MAX = 3650;
export declare class PageVerificationPageIdDto {
    pageId: string;
}
export declare class SetupVerificationDto {
    pageId: string;
    type?: VerificationType;
    mode?: ExpirationMode;
    periodAmount?: number;
    periodUnit?: PeriodUnit;
    fixedExpiresAt?: string;
    verifierIds: string[];
}
export declare class UpdateVerificationDto {
    pageId: string;
    mode?: ExpirationMode;
    periodAmount?: number;
    periodUnit?: PeriodUnit;
    fixedExpiresAt?: string;
    verifierIds?: string[];
}
export declare class VerifyPageDto {
    pageId: string;
}
export declare class RemoveVerificationDto {
    pageId: string;
}
export declare class SubmitForApprovalDto {
    pageId: string;
}
export declare class RejectApprovalDto {
    pageId: string;
    comment?: string;
}
export declare class ObsoletePageDto {
    pageId: string;
}
export declare class ListVerificationsDto {
    spaceIds?: string[];
    verifierId?: string;
    type?: VerificationType;
}
