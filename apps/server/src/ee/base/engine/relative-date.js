"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDateOperand = resolveDateOperand;
const ANCHORS = new Set([
    'today',
    'tomorrow',
    'yesterday',
    'oneWeekAgo',
    'oneWeekFromNow',
    'oneMonthAgo',
    'oneMonthFromNow',
]);
const RANGES = new Set([
    'pastWeek',
    'pastMonth',
    'pastYear',
    'thisWeek',
    'thisMonth',
    'thisYear',
    'nextWeek',
    'nextMonth',
    'nextYear',
]);
function startOfUtcDay(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function addDays(d, n) {
    const r = new Date(d.getTime());
    r.setUTCDate(r.getUTCDate() + n);
    return r;
}
function addMonths(d, n) {
    const day = d.getUTCDate();
    const r = new Date(d.getTime());
    r.setUTCDate(1);
    r.setUTCMonth(r.getUTCMonth() + n);
    const lastDay = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
    r.setUTCDate(Math.min(day, lastDay));
    return r;
}
function addYears(d, n) {
    return addMonths(d, n * 12);
}
function startOfUtcWeek(d) {
    const s = startOfUtcDay(d);
    const dow = (s.getUTCDay() + 6) % 7;
    return addDays(s, -dow);
}
function startOfUtcMonth(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function startOfUtcYear(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}
function resolveAnchor(preset, now) {
    const today = startOfUtcDay(now);
    switch (preset) {
        case 'today':
            return today;
        case 'tomorrow':
            return addDays(today, 1);
        case 'yesterday':
            return addDays(today, -1);
        case 'oneWeekAgo':
            return addDays(today, -7);
        case 'oneWeekFromNow':
            return addDays(today, 7);
        case 'oneMonthAgo':
            return addMonths(today, -1);
        case 'oneMonthFromNow':
            return addMonths(today, 1);
    }
}
function resolveRange(preset, now) {
    const tomorrow = addDays(startOfUtcDay(now), 1);
    switch (preset) {
        case 'pastWeek':
            return { start: addDays(tomorrow, -7), end: tomorrow };
        case 'pastMonth':
            return { start: addMonths(tomorrow, -1), end: tomorrow };
        case 'pastYear':
            return { start: addYears(tomorrow, -1), end: tomorrow };
        case 'nextWeek':
            return { start: tomorrow, end: addDays(tomorrow, 7) };
        case 'nextMonth':
            return { start: tomorrow, end: addMonths(tomorrow, 1) };
        case 'nextYear':
            return { start: tomorrow, end: addYears(tomorrow, 1) };
        case 'thisWeek': {
            const s = startOfUtcWeek(now);
            return { start: s, end: addDays(s, 7) };
        }
        case 'thisMonth': {
            const s = startOfUtcMonth(now);
            return { start: s, end: addMonths(s, 1) };
        }
        case 'thisYear': {
            const s = startOfUtcYear(now);
            return { start: s, end: addYears(s, 1) };
        }
    }
}
function resolveDateOperand(value, now = new Date()) {
    if (!value || typeof value !== 'object')
        return null;
    const v = value;
    if (v.mode === 'exact') {
        if (typeof v.date !== 'string')
            return null;
        const iso = v.date.length <= 10 ? `${v.date}T00:00:00.000Z` : v.date;
        const t = Date.parse(iso);
        if (Number.isNaN(t))
            return null;
        return { kind: 'instant', at: startOfUtcDay(new Date(t)) };
    }
    if (v.mode === 'relative') {
        if (!v.preset || !ANCHORS.has(v.preset))
            return null;
        return { kind: 'instant', at: resolveAnchor(v.preset, now) };
    }
    if (v.mode === 'range') {
        if (!v.preset || !RANGES.has(v.preset))
            return null;
        const { start, end } = resolveRange(v.preset, now);
        return { kind: 'range', start, end };
    }
    return null;
}
//# sourceMappingURL=relative-date.js.map