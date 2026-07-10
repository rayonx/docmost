export declare class ListAuditLogsDto {
    event?: string;
    resourceType?: string;
    resourceId?: string;
    actorId?: string;
    spaceId?: string;
    startDate?: string;
    endDate?: string;
}
export declare class UpdateAuditRetentionDto {
    auditRetentionDays: number;
}
export declare class AuditLogResponseDto {
    id: string;
    workspaceId: string;
    actorId?: string;
    actorType: string;
    event: string;
    resourceType: string;
    resourceId?: string;
    changes?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
    };
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    actor?: {
        id: string;
        name: string;
        email: string;
    };
    resource?: {
        id: string;
        name: string;
        slug?: string;
        slugId?: string;
    };
}
