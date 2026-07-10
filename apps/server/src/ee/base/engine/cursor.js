"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCursor = makeCursor;
const common_1 = require("@nestjs/common");
const MAX_CURSOR_DECODED_BYTES = 4096;
function makeCursor(sorts, tailKeys) {
    const types = new Map();
    for (const s of sorts)
        types.set(s.key, s.valueType);
    for (const k of tailKeys)
        types.set(k, 'text');
    return {
        encodeCursor(values) {
            const payload = {};
            for (const [k, v] of values) {
                payload[k] = encodeValue(v, types.get(k) ?? 'text');
            }
            return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
        },
        decodeCursor(cursor, fieldNames) {
            let parsed;
            try {
                const buf = Buffer.from(cursor, 'base64url');
                if (buf.byteLength > MAX_CURSOR_DECODED_BYTES) {
                    throw new common_1.BadRequestException('Invalid cursor');
                }
                parsed = JSON.parse(buf.toString('utf8'));
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException)
                    throw err;
                throw new common_1.BadRequestException('Invalid cursor');
            }
            if (typeof parsed !== 'object' || parsed === null) {
                throw new common_1.BadRequestException('Invalid cursor payload');
            }
            const out = {};
            for (const name of fieldNames) {
                if (!(name in parsed)) {
                    throw new common_1.BadRequestException(`Cursor missing field: ${name}`);
                }
                out[name] = parsed[name];
            }
            return out;
        },
        parseCursor(decoded) {
            const out = {};
            for (const [k, raw] of Object.entries(decoded)) {
                out[k] = decodeValue(raw, types.get(k) ?? 'text');
            }
            return out;
        },
    };
}
function encodeValue(value, type) {
    if (type === 'numeric') {
        if (value === null || value === undefined)
            return '';
        const n = typeof value === 'number' ? value : parseFloat(String(value));
        if (n === Number.POSITIVE_INFINITY || String(value) === 'Infinity') {
            return 'inf';
        }
        if (n === Number.NEGATIVE_INFINITY || String(value) === '-Infinity') {
            return '-inf';
        }
        if (Number.isNaN(n))
            return '';
        return String(n);
    }
    if (type === 'date') {
        if (value === null || value === undefined)
            return '';
        if (value instanceof Date)
            return value.toISOString();
        const s = String(value);
        if (s === 'infinity')
            return 'inf';
        if (s === '-infinity')
            return '-inf';
        return s;
    }
    if (type === 'bool') {
        return value ? '1' : '0';
    }
    return value == null ? '' : String(value);
}
function decodeValue(raw, type) {
    if (type === 'numeric') {
        if (raw === 'inf')
            return Number.POSITIVE_INFINITY;
        if (raw === '-inf')
            return Number.NEGATIVE_INFINITY;
        if (raw === '')
            return null;
        const n = parseFloat(raw);
        if (Number.isNaN(n))
            throw new common_1.BadRequestException('Invalid cursor');
        return n;
    }
    if (type === 'date') {
        if (raw === 'inf')
            return 'infinity';
        if (raw === '-inf')
            return '-infinity';
        if (raw === '')
            return null;
        if (Number.isNaN(Date.parse(raw))) {
            throw new common_1.BadRequestException('Invalid cursor');
        }
        return raw;
    }
    if (type === 'bool') {
        return raw === '1';
    }
    return raw;
}
//# sourceMappingURL=cursor.js.map