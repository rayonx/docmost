"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTableOfContents = extractTableOfContents;
exports.extractSections = extractSections;
exports.formatTocForLlm = formatTocForLlm;
exports.seedRelevantSections = seedRelevantSections;
exports.searchInPageContent = searchInPageContent;
exports.buildPositionalChunks = buildPositionalChunks;
const collaboration_util_1 = require("../../../collaboration/collaboration.util");
const token_counter_1 = require("./token-counter");
const fast_bm25_1 = require("fast-bm25");
const textsplitters_1 = require("@langchain/textsplitters");
const POSITIONAL_CHUNK_TOKENS = 1000;
const positionalChunkSplitter = new textsplitters_1.TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: POSITIONAL_CHUNK_TOKENS,
    chunkOverlap: 0,
});
async function splitIntoPositionalChunks(text) {
    const trimmed = text.trim();
    if (!trimmed)
        return [];
    return positionalChunkSplitter.splitText(trimmed);
}
function getTextFromNode(node) {
    if (!node)
        return '';
    if (node.type === 'text')
        return node.text || '';
    if (!node.content || !Array.isArray(node.content))
        return '';
    return node.content.map(getTextFromNode).join('');
}
function getHeadingLevel(node) {
    return node?.attrs?.level || 1;
}
function getHeadingId(node) {
    return node?.attrs?.id || '';
}
function firstSentence(text) {
    const trimmed = text.trim();
    if (!trimmed)
        return '';
    const match = trimmed.match(/^.+?[.!?](?:\s|$)/);
    if (match)
        return match[0].trim();
    return trimmed.slice(0, 150);
}
function extractTableOfContents(json) {
    const content = json?.content;
    if (!Array.isArray(content))
        return [];
    const entries = [];
    for (let i = 0; i < content.length; i++) {
        const node = content[i];
        if (node.type !== 'heading')
            continue;
        const id = getHeadingId(node);
        if (!id)
            continue;
        const level = getHeadingLevel(node);
        const title = getTextFromNode(node).trim();
        if (!title)
            continue;
        let blurb = '';
        for (let j = i + 1; j < content.length; j++) {
            if (content[j].type === 'heading')
                break;
            const text = getTextFromNode(content[j]).trim();
            if (text) {
                blurb = firstSentence(text);
                break;
            }
        }
        entries.push({ id, level, title, blurb });
    }
    return entries;
}
async function extractSections(json, sectionIds, perSectionTokenCap = 4000) {
    const content = json?.content;
    if (!Array.isArray(content))
        return [];
    const MAX_SECTIONS = 5;
    const MAX_TOTAL_TOKENS = 12_000;
    const ids = sectionIds.slice(0, MAX_SECTIONS);
    const idToIndex = new Map();
    for (let i = 0; i < content.length; i++) {
        const node = content[i];
        if (node.type === 'heading') {
            const hId = getHeadingId(node);
            if (hId)
                idToIndex.set(hId, i);
        }
    }
    let positionalChunks = null;
    const getPositionalChunks = async () => {
        if (positionalChunks !== null)
            return positionalChunks;
        const allText = content.map(getTextFromNode).join('\n');
        positionalChunks = await splitIntoPositionalChunks(allText);
        return positionalChunks;
    };
    const results = [];
    let totalTokens = 0;
    for (const id of ids) {
        if (totalTokens >= MAX_TOTAL_TOKENS)
            break;
        if (id.startsWith('chunk_')) {
            const chunkIndex = parseInt(id.replace('chunk_', ''), 10);
            if (isNaN(chunkIndex)) {
                results.push({ id, title: id, content: `Section ID not found: ${id}`, truncated: false });
                continue;
            }
            const chunks = await getPositionalChunks();
            const chunk = chunks[chunkIndex];
            if (!chunk) {
                results.push({ id, title: id, content: `Section ID not found: ${id}`, truncated: false });
                continue;
            }
            const { text: finalContent, truncated } = (0, token_counter_1.truncateToTokenBudget)(chunk, perSectionTokenCap);
            const chunkTokens = (0, token_counter_1.countTokens)(finalContent);
            if (totalTokens + chunkTokens > MAX_TOTAL_TOKENS)
                break;
            totalTokens += chunkTokens;
            results.push({ id, title: `Chunk ${chunkIndex}`, content: finalContent, truncated });
            continue;
        }
        const startIdx = idToIndex.get(id);
        if (startIdx === undefined) {
            results.push({ id, title: id, content: `Section ID not found: ${id}`, truncated: false });
            continue;
        }
        const headingNode = content[startIdx];
        const headingLevel = getHeadingLevel(headingNode);
        const title = getTextFromNode(headingNode).trim();
        let endIdx = content.length;
        for (let j = startIdx + 1; j < content.length; j++) {
            if (content[j].type === 'heading' && getHeadingLevel(content[j]) <= headingLevel) {
                endIdx = j;
                break;
            }
        }
        const sectionNodes = content.slice(startIdx, endIdx);
        const miniDoc = { type: 'doc', content: sectionNodes };
        let markdown;
        try {
            markdown = (0, collaboration_util_1.jsonToMarkdown)(miniDoc);
        }
        catch {
            markdown = sectionNodes.map(getTextFromNode).join('\n');
        }
        let tokens = (0, token_counter_1.countTokens)(markdown);
        let truncated = false;
        if (tokens > perSectionTokenCap) {
            const words = markdown.split(/\s+/);
            const approxWords = Math.floor(perSectionTokenCap * 0.75);
            markdown = words.slice(0, approxWords).join(' ') + '\n\n[truncated]';
            tokens = (0, token_counter_1.countTokens)(markdown);
            truncated = true;
        }
        if (totalTokens + tokens > MAX_TOTAL_TOKENS)
            break;
        totalTokens += tokens;
        results.push({ id, title, content: markdown, truncated });
    }
    return results;
}
function formatTocForLlm(title, pageId, toc, seededSections) {
    const lines = [];
    lines.push(`Page: "${title}" (id: ${pageId})`);
    if (seededSections && seededSections.length > 0) {
        lines.push('');
        lines.push('Relevant sections (based on query):');
        for (const sec of seededSections) {
            lines.push(`--- ${sec.title} [id: ${sec.id}] ---`);
            lines.push(sec.content);
            if (sec.truncated)
                lines.push('[truncated]');
            lines.push('--- End ---');
            lines.push('');
        }
    }
    lines.push('All sections:');
    const counters = [];
    for (const entry of toc) {
        if (entry.id.startsWith('chunk_')) {
            const blurbStr = entry.blurb ? ` — "${entry.blurb}"` : '';
            lines.push(`  ${entry.title} [id: ${entry.id}]${blurbStr}`);
            continue;
        }
        const level = entry.level;
        while (counters.length < level)
            counters.push(0);
        counters.length = level;
        counters[level - 1]++;
        const numbering = counters.join('.');
        const indent = '  '.repeat(Math.max(0, level - 1));
        const blurbStr = entry.blurb ? ` — "${entry.blurb}"` : '';
        lines.push(`${indent}  ${numbering}. ${entry.title} [id: ${entry.id}]${blurbStr}`);
    }
    return lines.join('\n');
}
const SEED_MAX_SECTIONS = 2;
const SEED_TOKEN_CAP = 2000;
async function seedRelevantSections(json, toc, userMessage) {
    if (!userMessage.trim() || toc.length === 0)
        return [];
    const docs = toc.map((entry) => ({
        title: entry.title || ' ',
        content: entry.blurb || ' ',
    }));
    const bm25 = new fast_bm25_1.BM25(docs, {
        k1: 1.5,
        b: 0.75,
        minLength: 1,
        fieldBoosts: { title: 3.0, content: 1.0 },
    });
    const matches = bm25.search(userMessage, SEED_MAX_SECTIONS);
    const topIds = matches
        .filter((r) => r.score > 0)
        .map((r) => toc[r.index].id);
    if (topIds.length === 0)
        return [];
    return await extractSections(json, topIds, SEED_TOKEN_CAP);
}
async function searchInPageContent(json, query) {
    const content = json?.content;
    if (!Array.isArray(content))
        return [];
    const sections = [];
    let currentSection = null;
    for (const node of content) {
        if (node.type === 'heading') {
            const id = getHeadingId(node);
            const title = getTextFromNode(node).trim();
            if (id && title) {
                currentSection = { id, title, text: '' };
                sections.push(currentSection);
            }
        }
        else if (currentSection) {
            currentSection.text += getTextFromNode(node) + ' ';
        }
    }
    if (sections.length === 0) {
        const chunks = await buildPositionalChunks(json);
        for (const chunk of chunks) {
            sections.push({ id: chunk.id, title: chunk.title, text: chunk.blurb });
        }
    }
    if (!query.trim())
        return [];
    const docs = sections.map((sec) => ({
        title: sec.title || ' ',
        content: sec.text || ' ',
    }));
    const bm25 = new fast_bm25_1.BM25(docs, {
        k1: 1.5,
        b: 0.75,
        minLength: 1,
        fieldBoosts: { title: 3.0, content: 1.0 },
    });
    const results = bm25.search(query, 5);
    const queryKeywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    return results
        .filter((r) => r.score > 0)
        .map((r) => {
        const sec = sections[r.index];
        const lower = sec.text.toLowerCase();
        let bestIdx = 0;
        for (const kw of queryKeywords) {
            const idx = lower.indexOf(kw);
            if (idx !== -1) {
                bestIdx = idx;
                break;
            }
        }
        const start = Math.max(0, bestIdx - 60);
        const snippet = sec.text.slice(start, start + 150).trim();
        return { sectionId: sec.id, sectionTitle: sec.title, snippet };
    });
}
async function buildPositionalChunks(json) {
    const content = json?.content;
    if (!Array.isArray(content))
        return [];
    const fullText = content.map(getTextFromNode).join('\n');
    const chunks = await splitIntoPositionalChunks(fullText);
    return chunks.map((chunk, idx) => ({
        id: `chunk_${idx}`,
        level: 1,
        title: `Chunk ${idx}`,
        blurb: firstSentence(chunk),
    }));
}
//# sourceMappingURL=page-content-extractor.js.map