import { ClickHouseClient } from '@clickhouse/client';
export type ClickHouseMigration = {
    name: string;
    up: (client: ClickHouseClient) => Promise<void>;
};
export declare const migrations: ClickHouseMigration[];
