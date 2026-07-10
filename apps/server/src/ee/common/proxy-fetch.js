"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProxyAwareFetch = getProxyAwareFetch;
const undici_1 = require("undici");
const LOOPBACK_BYPASS = ['localhost', '127.0.0.1', '::1'];
let cachedAgent;
function hasProxyEnv() {
    return Boolean(process.env.HTTP_PROXY ||
        process.env.HTTPS_PROXY ||
        process.env.http_proxy ||
        process.env.https_proxy);
}
function buildAgent() {
    const existing = process.env.NO_PROXY || process.env.no_proxy || '';
    const merged = [existing, ...LOOPBACK_BYPASS]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(',');
    return new undici_1.EnvHttpProxyAgent({ noProxy: merged });
}
function getProxyAwareFetch() {
    if (!hasProxyEnv())
        return undefined;
    cachedAgent ??= buildAgent();
    const agent = cachedAgent;
    return ((input, init) => (0, undici_1.fetch)(input, {
        ...init,
        dispatcher: agent,
    }));
}
//# sourceMappingURL=proxy-fetch.js.map