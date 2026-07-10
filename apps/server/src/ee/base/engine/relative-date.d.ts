export type RelativeAnchor = 'today' | 'tomorrow' | 'yesterday' | 'oneWeekAgo' | 'oneWeekFromNow' | 'oneMonthAgo' | 'oneMonthFromNow';
export type RelativeRange = 'pastWeek' | 'pastMonth' | 'pastYear' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'nextWeek' | 'nextMonth' | 'nextYear';
export type DateOperand = {
    mode: 'exact';
    date: string;
} | {
    mode: 'relative';
    preset: RelativeAnchor;
} | {
    mode: 'range';
    preset: RelativeRange;
};
export type ResolvedOperand = {
    kind: 'instant';
    at: Date;
} | {
    kind: 'range';
    start: Date;
    end: Date;
};
export declare function resolveDateOperand(value: unknown, now?: Date): ResolvedOperand | null;
