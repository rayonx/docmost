import { RawBuilder } from 'kysely';
export declare function textCell(propertyId: string): RawBuilder<string>;
export declare function numericCell(propertyId: string): RawBuilder<number>;
export declare function dateCell(propertyId: string): RawBuilder<Date>;
export declare function boolCell(propertyId: string): RawBuilder<boolean>;
export declare function arrayCell(propertyId: string): RawBuilder<unknown>;
export declare function escapeIlike(value: string): string;
