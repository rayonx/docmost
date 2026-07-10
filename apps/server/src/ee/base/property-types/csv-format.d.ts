import type { ReferenceResolutionContext } from '../reference/reference-source';
export type CellCsvContext = ReferenceResolutionContext;
export declare function resolveChoiceName(typeOptions: unknown, id: unknown): string;
export declare function resolveUser(id: unknown, ctx: CellCsvContext): string;
export declare function neutralizeCsvFormula(s: string): string;
