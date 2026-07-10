export type TocEntry = {
    id: string;
    level: number;
    title: string;
    blurb: string;
};
export type SectionResult = {
    id: string;
    title: string;
    content: string;
    truncated: boolean;
};
export type SearchMatch = {
    sectionId: string;
    sectionTitle: string;
    snippet: string;
};
export declare function extractTableOfContents(json: any): TocEntry[];
export declare function extractSections(json: any, sectionIds: string[], perSectionTokenCap?: number): Promise<SectionResult[]>;
export declare function formatTocForLlm(title: string, pageId: string, toc: TocEntry[], seededSections?: SectionResult[]): string;
export declare function seedRelevantSections(json: any, toc: TocEntry[], userMessage: string): Promise<SectionResult[]>;
export declare function searchInPageContent(json: any, query: string): Promise<SearchMatch[]>;
export declare function buildPositionalChunks(json: any): Promise<TocEntry[]>;
