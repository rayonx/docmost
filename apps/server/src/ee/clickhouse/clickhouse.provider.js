"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clickhouseClientProvider = void 0;
const client_1 = require("@clickhouse/client");
const common_1 = require("@nestjs/common");
const environment_service_1 = require("../../integrations/environment/environment.service");
const clickhouse_constants_1 = require("./clickhouse.constants");
const logger = new common_1.Logger('ClickHouseProvider');
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3_000;
async function bootstrapDatabase(url, database) {
    const parsed = new URL(url);
    parsed.pathname = '/';
    const bootstrapClient = (0, client_1.createClient)({ url: parsed.toString() });
    try {
        await bootstrapClient.command({
            query: `CREATE DATABASE IF NOT EXISTS ${database}`,
        });
    }
    finally {
        await bootstrapClient.close();
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.clickhouseClientProvider = {
    provide: clickhouse_constants_1.CLICKHOUSE_CLIENT,
    useFactory: async (environmentService) => {
        if (environmentService.getEventStoreDriver() !== 'clickhouse')
            return null;
        const url = environmentService.getClickHouseUrl();
        if (!url)
            return null;
        const parsed = new URL(url);
        const database = parsed.pathname.slice(1) || 'default';
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(database)) {
            logger.error(`Invalid ClickHouse database name: "${database}". Must be alphanumeric with underscores.`);
            return null;
        }
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                await bootstrapDatabase(url, database);
                const client = (0, client_1.createClient)({ url });
                logger.log(`Connected to ClickHouse (database: ${database})`);
                return client;
            }
            catch (err) {
                if (attempt < MAX_RETRIES) {
                    logger.warn(`ClickHouse connection attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                    await sleep(RETRY_DELAY_MS);
                }
                else {
                    logger.error({ err }, `Failed to connect to ClickHouse after ${MAX_RETRIES} attempts`);
                }
            }
        }
        return null;
    },
    inject: [environment_service_1.EnvironmentService],
};
//# sourceMappingURL=clickhouse.provider.js.map