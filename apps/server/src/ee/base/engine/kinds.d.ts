export declare const PropertyKind: {
    readonly TEXT: "text";
    readonly NUMERIC: "numeric";
    readonly DATE: "date";
    readonly BOOL: "bool";
    readonly SELECT: "select";
    readonly MULTI: "multi";
    readonly PERSON: "person";
    readonly FILE: "file";
    readonly PAGE: "page";
    readonly SYS_USER: "sys_user";
};
export type PropertyKindValue = (typeof PropertyKind)[keyof typeof PropertyKind];
export declare const SYSTEM_COLUMN: Record<string, 'createdAt' | 'updatedAt' | 'lastUpdatedById'>;
export declare function isSystemType(type: string): boolean;
