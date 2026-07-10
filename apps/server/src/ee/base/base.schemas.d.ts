import { z } from 'zod';
import type { ReferenceResolutionContext } from './reference/reference-source';
export declare const BasePropertyType: {
    readonly TEXT: "text";
    readonly NUMBER: "number";
    readonly SELECT: "select";
    readonly STATUS: "status";
    readonly MULTI_SELECT: "multiSelect";
    readonly DATE: "date";
    readonly PERSON: "person";
    readonly FILE: "file";
    readonly PAGE: "page";
    readonly CHECKBOX: "checkbox";
    readonly URL: "url";
    readonly EMAIL: "email";
    readonly CREATED_AT: "createdAt";
    readonly LAST_EDITED_AT: "lastEditedAt";
    readonly LAST_EDITED_BY: "lastEditedBy";
    readonly FORMULA: "formula";
    readonly LONG_TEXT: "longText";
};
export type BasePropertyTypeValue = (typeof BasePropertyType)[keyof typeof BasePropertyType];
export declare const BASE_PROPERTY_TYPES: ("number" | "text" | "createdAt" | "status" | "email" | "date" | "page" | "select" | "checkbox" | "file" | "url" | "person" | "multiSelect" | "lastEditedAt" | "lastEditedBy" | "formula" | "longText")[];
export declare const BaseViewType: {
    readonly TABLE: "table";
    readonly KANBAN: "kanban";
    readonly CALENDAR: "calendar";
};
export type BaseViewTypeValue = (typeof BaseViewType)[keyof typeof BaseViewType];
export declare const BASE_VIEW_TYPES: ("table" | "kanban" | "calendar")[];
export declare const MAX_MULTI_SELECT_PER_CELL = 100;
export declare const MAX_PERSON_REFS_PER_CELL = 100;
export declare const MAX_FILE_REFS_PER_CELL = 50;
export declare const choiceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    color: z.ZodString;
    category: z.ZodOptional<z.ZodEnum<{
        complete: "complete";
        todo: "todo";
        inProgress: "inProgress";
    }>>;
}, z.core.$strip>;
export declare const selectTypeOptionsSchema: z.ZodObject<{
    choices: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodString;
        category: z.ZodOptional<z.ZodEnum<{
            complete: "complete";
            todo: "todo";
            inProgress: "inProgress";
        }>>;
    }, z.core.$strip>>>;
    choiceOrder: z.ZodDefault<z.ZodArray<z.ZodString>>;
    disableColors: z.ZodOptional<z.ZodBoolean>;
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>>;
}, z.core.$loose>;
export declare const numberTypeOptionsSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        percent: "percent";
        currency: "currency";
        progress: "progress";
        plain: "plain";
    }>>>;
    separators: z.ZodOptional<z.ZodEnum<{
        local: "local";
        none: "none";
        comma_period: "comma_period";
        period_comma: "period_comma";
        space_comma: "space_comma";
        space_period: "space_period";
    }>>;
    precision: z.ZodOptional<z.ZodNumber>;
    currencyCode: z.ZodOptional<z.ZodString>;
    currencySymbol: z.ZodOptional<z.ZodString>;
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$loose>;
export declare const dateTypeOptionsSchema: z.ZodObject<{
    dateFormat: z.ZodOptional<z.ZodString>;
    timeFormat: z.ZodOptional<z.ZodEnum<{
        "24h": "24h";
        "12h": "12h";
    }>>;
    includeTime: z.ZodOptional<z.ZodBoolean>;
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$loose>;
export declare const textTypeOptionsSchema: z.ZodObject<{
    richText: z.ZodOptional<z.ZodBoolean>;
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$loose>;
export declare const longTextTypeOptionsSchema: z.ZodObject<{
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$loose>;
export declare const checkboxTypeOptionsSchema: z.ZodObject<{
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, z.core.$loose>;
export declare const urlTypeOptionsSchema: z.ZodObject<{
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodURL>>;
}, z.core.$loose>;
export declare const emailTypeOptionsSchema: z.ZodObject<{
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
}, z.core.$loose>;
export declare const personTypeOptionsSchema: z.ZodObject<{
    allowMultiple: z.ZodDefault<z.ZodBoolean>;
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodUUID, z.ZodArray<z.ZodUUID>]>>>;
}, z.core.$loose>;
export declare const emptyTypeOptionsSchema: z.ZodObject<{}, z.core.$loose>;
export declare const formulaTypeOptionsSchema: z.ZodObject<{
    source: z.ZodString;
    ast: z.ZodAny;
    resultType: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        date: "date";
        null: "null";
    }>;
    dependencies: z.ZodArray<z.ZodString>;
    astVersion: z.ZodLiteral<1>;
    formatOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$loose>;
export declare function choiceIdSet(typeOptions: unknown): Set<string> | null;
export declare const fileCellSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodUUID;
    fileName: z.ZodString;
    mimeType: z.ZodOptional<z.ZodString>;
    fileSize: z.ZodOptional<z.ZodNumber>;
    filePath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
export declare function personAllowsMultiple(typeOptions: unknown): boolean;
export declare function personCellSchemaFor(typeOptions: unknown): z.ZodType;
export declare function cellShapeMatchesType(type: BasePropertyTypeValue, value: unknown): boolean;
export declare function isAlreadyConvertedCell(fromType: BasePropertyTypeValue, toType: BasePropertyTypeValue, value: unknown): boolean;
export type CellConversionContext = ReferenceResolutionContext & {
    fromTypeOptions?: unknown;
    toTypeOptions?: unknown;
};
export declare function attemptCellConversion(fromType: BasePropertyTypeValue, toType: BasePropertyTypeValue, value: unknown, ctx: CellConversionContext): {
    converted: boolean;
    value: unknown;
};
export declare const viewSortSchema: z.ZodObject<{
    propertyId: z.ZodString;
    direction: z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>;
}, z.core.$strip>;
declare const viewFilterConditionSchema: z.ZodObject<{
    propertyId: z.ZodString;
    op: z.ZodEnum<{
        endsWith: "endsWith";
        startsWith: "startsWith";
        all: "all";
        none: "none";
        eq: "eq";
        after: "after";
        before: "before";
        any: "any";
        neq: "neq";
        gt: "gt";
        gte: "gte";
        lt: "lt";
        lte: "lte";
        contains: "contains";
        ncontains: "ncontains";
        isEmpty: "isEmpty";
        isNotEmpty: "isNotEmpty";
        onOrBefore: "onOrBefore";
        onOrAfter: "onOrAfter";
    }>;
    value: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
type ViewFilterCondition = z.infer<typeof viewFilterConditionSchema>;
type ViewFilterGroup = {
    op: 'and' | 'or';
    children: Array<ViewFilterCondition | ViewFilterGroup>;
};
export declare const NO_VALUE_CHOICE_ID = "__no_value";
export declare const viewConfigSchema: z.ZodObject<{
    sorts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        propertyId: z.ZodString;
        direction: z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>;
    }, z.core.$strip>>>;
    filter: z.ZodOptional<z.ZodType<ViewFilterGroup, unknown, z.core.$ZodTypeInternals<ViewFilterGroup, unknown>>>;
    visiblePropertyIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    hiddenPropertyIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    propertyWidths: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    propertyOrder: z.ZodOptional<z.ZodArray<z.ZodString>>;
    groupByPropertyId: z.ZodOptional<z.ZodString>;
    hiddenChoiceIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    choiceOrder: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$loose>;
export type ViewConfig = z.infer<typeof viewConfigSchema>;
export declare const viewConfigPatchSchema: z.ZodObject<{
    sorts: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        propertyId: z.ZodString;
        direction: z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>;
    }, z.core.$strip>>>>;
    filter: z.ZodOptional<z.ZodNullable<z.ZodType<ViewFilterGroup, unknown, z.core.$ZodTypeInternals<ViewFilterGroup, unknown>>>>;
    visiblePropertyIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    hiddenPropertyIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    propertyWidths: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
    propertyOrder: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    groupByPropertyId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hiddenChoiceIds: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    choiceOrder: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
}, z.core.$loose>;
export type ViewConfigPatch = z.infer<typeof viewConfigPatchSchema>;
export {};
