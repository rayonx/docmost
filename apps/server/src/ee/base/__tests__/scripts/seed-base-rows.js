"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const dotenv = require("dotenv");
const kysely_1 = require("kysely");
const kysely_postgres_js_1 = require("kysely-postgres-js");
const postgres_1 = require("postgres");
const uuid_1 = require("uuid");
const fractional_indexing_jittered_1 = require("fractional-indexing-jittered");
const server_1 = require("@docmost/base-formula/server");
const helpers_1 = require("../../../../common/helpers");
const TOTAL_ROWS = Number(process.env.TOTAL_ROWS) || 10000;
const BATCH_SIZE = 2000;
const SPACE_ID = process.env.SPACE_ID || '019c69a3-dd47-7014-8b87-ec8f167577ee';
const envFilePath = path.resolve(process.cwd(), '..', '..', '.env');
dotenv.config({ path: envFilePath });
function normalizePostgresUrl(url) {
    const parsed = new URL(url);
    const newParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams) {
        if (key === 'sslmode' && value === 'no-verify')
            continue;
        if (key === 'schema')
            continue;
        newParams.append(key, value);
    }
    parsed.search = newParams.toString();
    return parsed.toString();
}
const db = new kysely_1.Kysely({
    dialect: new kysely_postgres_js_1.PostgresJSDialect({
        postgres: (0, postgres_1.default)(normalizePostgresUrl(process.env.DATABASE_URL)),
    }),
});
const WORDS = [
    'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf',
    'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November',
    'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform',
    'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu', 'Report', 'Analysis',
    'Summary', 'Review', 'Update', 'Draft', 'Final', 'Proposal', 'Budget',
    'Timeline', 'Milestone', 'Objective', 'Strategy', 'Initiative',
];
const COLORS = [
    'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray',
];
const FILE_TYPES = [
    { ext: 'pdf', mime: 'application/pdf' },
    { ext: 'png', mime: 'image/png' },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { ext: 'csv', mime: 'text/csv' },
];
function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}
function randomWords(min, max) {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(randomItem(WORDS));
    }
    return result.join(' ');
}
function makeChoices(names) {
    return names.map((name, i) => ({
        id: (0, helpers_1.generateBaseChoiceId)(),
        name,
        color: COLORS[i % COLORS.length],
    }));
}
function makeStatusChoices() {
    const all = [
        { id: (0, helpers_1.generateBaseChoiceId)(), name: 'Not Started', color: 'gray', category: 'todo' },
        { id: (0, helpers_1.generateBaseChoiceId)(), name: 'In Progress', color: 'blue', category: 'inProgress' },
        { id: (0, helpers_1.generateBaseChoiceId)(), name: 'In Review', color: 'purple', category: 'inProgress' },
        { id: (0, helpers_1.generateBaseChoiceId)(), name: 'Done', color: 'green', category: 'complete' },
        { id: (0, helpers_1.generateBaseChoiceId)(), name: 'Cancelled', color: 'red', category: 'complete' },
    ];
    return { choices: all, choiceOrder: all.map((c) => c.id) };
}
function buildPropertyDefinitions() {
    const priorityChoices = makeChoices(['Low', 'Medium', 'High', 'Critical']);
    const categoryChoices = makeChoices(['Engineering', 'Design', 'Marketing', 'Sales', 'Support', 'Operations']);
    const tagChoices = makeChoices(['Bug', 'Feature', 'Improvement', 'Documentation', 'Research']);
    const statusOpts = makeStatusChoices();
    return [
        { name: 'Title', type: 'text', isPrimary: true },
        { name: 'Notes', type: 'text' },
        { name: 'Description', type: 'longText' },
        { name: 'Status', type: 'status', typeOptions: statusOpts },
        { name: 'Priority', type: 'select', typeOptions: { choices: priorityChoices, choiceOrder: priorityChoices.map((c) => c.id) } },
        { name: 'Category', type: 'select', typeOptions: { choices: categoryChoices, choiceOrder: categoryChoices.map((c) => c.id) } },
        { name: 'Tags', type: 'multiSelect', typeOptions: { choices: tagChoices, choiceOrder: tagChoices.map((c) => c.id) } },
        { name: 'Due Date', type: 'date', typeOptions: { dateFormat: 'YYYY-MM-DD', includeTime: false } },
        { name: 'Estimate', type: 'number', typeOptions: { format: 'plain', precision: 1 } },
        { name: 'Budget', type: 'number', typeOptions: { format: 'currency', precision: 2, currencySymbol: '$' } },
        { name: 'Approved', type: 'checkbox' },
        { name: 'Website', type: 'url' },
        { name: 'Contact Email', type: 'email' },
        { name: 'Assignees', type: 'person', typeOptions: { allowMultiple: true } },
        { name: 'Attachments', type: 'file' },
        { name: 'Related Page', type: 'page' },
        { name: 'Created', type: 'createdAt' },
        { name: 'Last Edited', type: 'lastEditedAt' },
        { name: 'Last Edited By', type: 'lastEditedBy' },
    ];
}
const FORMULA_NAME = 'Total Cost';
const FORMULA_SOURCE = 'prop("Estimate") + prop("Budget")';
function propResultType(type) {
    if (type === 'number')
        return 'number';
    if (type === 'text' || type === 'url' || type === 'email' || type === 'longText')
        return 'string';
    if (type === 'checkbox')
        return 'boolean';
    if (type === 'date' || type === 'createdAt' || type === 'lastEditedAt')
        return 'date';
    return 'null';
}
function compileFormula(source, properties) {
    const nameToId = new Map(properties.map((p) => [p.name, p.id]));
    const raw = (0, server_1.parseRaw)(source);
    const resolved = (0, server_1.resolve)(raw, nameToId);
    const typeMap = new Map(properties.map((p) => [p.id, propResultType(p.type)]));
    const { resultType } = (0, server_1.typecheck)(resolved.ast, typeMap, server_1.registry);
    return {
        source,
        ast: resolved.ast,
        resultType,
        dependencies: resolved.dependencies,
        astVersion: 1,
    };
}
const NO_CELL_TYPES = new Set([
    'createdAt',
    'lastEditedAt',
    'lastEditedBy',
    'formula',
]);
function buildCellGenerator(property, userIds, pageIds) {
    if (NO_CELL_TYPES.has(property.type))
        return null;
    const typeOptions = property.type_options;
    switch (property.type) {
        case 'text':
            return () => randomWords(2, 6);
        case 'longText':
            return () => randomWords(20, 60);
        case 'number':
            return () => Math.round(Math.random() * 10000 * 100) / 100;
        case 'select':
        case 'status': {
            const choices = typeOptions?.choices ?? [];
            if (choices.length === 0)
                return null;
            return () => randomItem(choices).id;
        }
        case 'multiSelect': {
            const choices = typeOptions?.choices ?? [];
            if (choices.length === 0)
                return () => [];
            return () => {
                const count = 1 + Math.floor(Math.random() * Math.min(3, choices.length));
                const shuffled = [...choices].sort(() => Math.random() - 0.5);
                return shuffled.slice(0, count).map((c) => c.id);
            };
        }
        case 'date': {
            const start = new Date(2020, 0, 1).getTime();
            const range = new Date(2026, 0, 1).getTime() - start;
            return () => new Date(start + Math.random() * range).toISOString();
        }
        case 'checkbox':
            return () => Math.random() > 0.5;
        case 'url':
            return () => `https://example.com/page/${Math.floor(Math.random() * 100000)}`;
        case 'email':
            return () => `user${Math.floor(Math.random() * 100000)}@example.com`;
        case 'person': {
            if (userIds.length === 0)
                return null;
            return () => {
                const count = 1 + Math.floor(Math.random() * Math.min(3, userIds.length));
                const shuffled = [...userIds].sort(() => Math.random() - 0.5);
                return shuffled.slice(0, count);
            };
        }
        case 'page': {
            if (pageIds.length === 0)
                return null;
            return () => (Math.random() < 0.85 ? randomItem(pageIds) : null);
        }
        case 'file':
            return () => {
                const count = Math.floor(Math.random() * 3);
                const files = [];
                for (let i = 0; i < count; i++) {
                    const id = (0, uuid_1.v7)();
                    const { ext, mime } = randomItem(FILE_TYPES);
                    const fileName = `${randomItem(WORDS).toLowerCase()}-${Math.floor(Math.random() * 1000)}.${ext}`;
                    files.push({
                        id,
                        fileName,
                        mimeType: mime,
                        fileSize: 1024 + Math.floor(Math.random() * 5_000_000),
                        filePath: `/files/${id}/${fileName}`,
                    });
                }
                return files;
            };
        default:
            return null;
    }
}
async function createBasePage(workspaceId, spaceId, creatorId) {
    const pageId = (0, uuid_1.v7)();
    const rowCountLabel = TOTAL_ROWS >= 1000 ? `${Math.round(TOTAL_ROWS / 1000)}K` : `${TOTAL_ROWS}`;
    const title = `Seed Base ${rowCountLabel} (all property types)`;
    const lastPage = await db
        .selectFrom('pages')
        .select('position')
        .where('space_id', '=', spaceId)
        .where('parent_page_id', 'is', null)
        .where('deleted_at', 'is', null)
        .orderBy('position', 'desc')
        .limit(1)
        .executeTakeFirst();
    const position = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(lastPage?.position ?? null, null);
    await db
        .insertInto('pages')
        .values({
        id: pageId,
        slug_id: (0, helpers_1.generateSlugId)(),
        title,
        position,
        space_id: spaceId,
        workspace_id: workspaceId,
        creator_id: creatorId,
        last_updated_by_id: creatorId,
        is_base: true,
        created_at: new Date(),
        updated_at: new Date(),
    })
        .execute();
    console.log(`Created base page: ${title}`);
    console.log(`Page ID: ${pageId}\n`);
    return pageId;
}
async function insertProperties(pageId, workspaceId, defs) {
    let propPosition = null;
    const rows = [];
    for (const def of defs) {
        propPosition = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(propPosition, null);
        rows.push({
            id: (0, helpers_1.generateBasePropertyId)(),
            page_id: pageId,
            name: def.name,
            type: def.type,
            position: propPosition,
            type_options: def.typeOptions ?? {},
            is_primary: def.isPrimary ?? false,
            schema_version: 1,
            workspace_id: workspaceId,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }
    await db.insertInto('base_properties').values(rows).execute();
    return rows;
}
async function main() {
    const space = await db
        .selectFrom('spaces')
        .select(['id', 'workspace_id'])
        .where('id', '=', SPACE_ID)
        .executeTakeFirstOrThrow();
    const workspaceId = space.workspace_id;
    const users = await db
        .selectFrom('users')
        .select('id')
        .where('workspace_id', '=', workspaceId)
        .execute();
    const userIds = users.map((u) => u.id);
    const creatorId = userIds[0] ?? null;
    const randomUser = () => userIds.length > 0 ? randomItem(userIds) : creatorId;
    const pages = await db
        .selectFrom('pages')
        .select('id')
        .where('space_id', '=', SPACE_ID)
        .where('is_base', '=', false)
        .where('deleted_at', 'is', null)
        .limit(500)
        .execute();
    const pageIds = pages.map((p) => p.id);
    console.log(`Workspace: ${workspaceId}`);
    console.log(`Space: ${SPACE_ID}`);
    console.log(`Users available: ${userIds.length}`);
    console.log(`Pages available for refs: ${pageIds.length}`);
    console.log(`Creator: ${creatorId ?? '(none)'}\n`);
    const pageId = await createBasePage(workspaceId, SPACE_ID, creatorId);
    const baseDefs = buildPropertyDefinitions();
    const baseProps = await insertProperties(pageId, workspaceId, baseDefs);
    const formulaTypeOptions = compileFormula(FORMULA_SOURCE, baseProps.map((p) => ({ id: p.id, name: p.name, type: p.type })));
    let lastPropPosition = baseProps[baseProps.length - 1].position;
    lastPropPosition = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(lastPropPosition, null);
    const formulaProp = {
        id: (0, helpers_1.generateBasePropertyId)(),
        page_id: pageId,
        name: FORMULA_NAME,
        type: 'formula',
        position: lastPropPosition,
        type_options: formulaTypeOptions,
        is_primary: false,
        schema_version: 1,
        workspace_id: workspaceId,
        created_at: new Date(),
        updated_at: new Date(),
    };
    await db.insertInto('base_properties').values(formulaProp).execute();
    const allProps = [...baseProps, formulaProp];
    console.log(`Created ${allProps.length} properties:`);
    for (const p of allProps) {
        console.log(`  - ${p.name} (${p.type})${p.is_primary ? ' [primary]' : ''}${NO_CELL_TYPES.has(p.type) ? ' [virtual]' : ''}`);
    }
    console.log('');
    await db
        .insertInto('base_views')
        .values({
        id: (0, uuid_1.v7)(),
        page_id: pageId,
        name: 'Table',
        type: 'table',
        position: (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(null, null),
        config: {},
        workspace_id: workspaceId,
        creator_id: creatorId,
        created_at: new Date(),
        updated_at: new Date(),
    })
        .execute();
    console.log('Created view: Table\n');
    const generators = [];
    for (const prop of baseProps) {
        const gen = buildCellGenerator(prop, userIds, pageIds);
        if (gen)
            generators.push({ propertyId: prop.id, generate: gen });
    }
    const evalProperties = new Map(allProps.map((p) => [
        p.id,
        { id: p.id, type: p.type, typeOptions: p.type_options },
    ]));
    const formulaAst = formulaTypeOptions.ast;
    const evalFormula = (cells) => (0, server_1.evaluate)(formulaAst, cells, {
        registry: server_1.registry,
        properties: evalProperties,
        depth: 0,
        maxDepth: server_1.DEFAULT_MAX_DEPTH,
        memo: new Map(),
    });
    console.log(`Generating ${TOTAL_ROWS.toLocaleString()} positions...`);
    let lastPosition = null;
    const positions = new Array(TOTAL_ROWS);
    for (let i = 0; i < TOTAL_ROWS; i++) {
        lastPosition = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(lastPosition, null);
        positions[i] = lastPosition;
    }
    console.log(`Positions generated (last: ${positions[positions.length - 1]})\n`);
    const startTime = Date.now();
    const totalBatches = Math.ceil(TOTAL_ROWS / BATCH_SIZE);
    for (let batchStart = 0; batchStart < TOTAL_ROWS; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_ROWS);
        const rows = [];
        for (let i = batchStart; i < batchEnd; i++) {
            const cells = {};
            for (const { propertyId, generate } of generators) {
                const value = generate();
                if (value !== null && value !== undefined)
                    cells[propertyId] = value;
            }
            cells[formulaProp.id] = evalFormula(cells);
            rows.push({
                id: (0, uuid_1.v7)(),
                page_id: pageId,
                cells,
                position: positions[i],
                creator_id: randomUser(),
                last_updated_by_id: randomUser(),
                workspace_id: workspaceId,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
        await db.insertInto('base_rows').values(rows).execute();
        const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Batch ${batchNum}/${totalBatches} inserted (${batchEnd.toLocaleString()} rows, ${elapsed}s elapsed)`);
    }
    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nDone. Inserted ${TOTAL_ROWS.toLocaleString()} rows in ${totalElapsed}s`);
    console.log(`\nBase page ID: ${pageId}`);
    await db.destroy();
    process.exit(0);
}
main().catch((err) => {
    console.error('Seed script failed:', err);
    db.destroy().finally(() => process.exit(1));
});
//# sourceMappingURL=seed-base-rows.js.map