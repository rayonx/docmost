export type ReferenceKind = 'page' | 'person' | 'file' | 'baseRow';
export type ReferenceResolutionContext = {
    userNames?: Map<string, string>;
    pageTitles?: Map<string, string>;
    attachmentNames?: Map<string, string>;
    rowTitles?: Map<string, string>;
};
export type ServerReferenceSource = {
    kind: ReferenceKind;
    extractIds: (cell: unknown) => string[];
    resolveDisplay: (cell: unknown, ctx: ReferenceResolutionContext) => string[];
    contextNeed: 'users' | 'pages' | 'attachments';
};
export declare const SERVER_REFERENCE_SOURCES: Partial<Record<ReferenceKind, ServerReferenceSource>>;
export declare function referenceSource(kind: string): ServerReferenceSource | undefined;
export declare function resolveReferenceDisplay(kind: string, cell: unknown, ctx: ReferenceResolutionContext): string[];
