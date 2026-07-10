"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
async function up(client) {
    await client.command({
        query: `
      CREATE TABLE IF NOT EXISTS audit (
          id UUID,
          workspace_id UUID,
          actor_id Nullable(UUID),
          actor_type LowCardinality(String) DEFAULT 'user',
          event LowCardinality(String),
          resource_type LowCardinality(String),
          resource_id Nullable(UUID),
          space_id Nullable(UUID),
          changes String DEFAULT '',
          metadata String DEFAULT '',
          ip_address Nullable(String),
          created_at DateTime64(3, 'UTC') DEFAULT now64(3)
      )
      -- UUIDv7ToDateTime extracts the timestamp from UUIDv7 so ClickHouse
      -- stores rows chronologically on disk (ClickHouse sorts UUIDs by their second half)
      ENGINE = MergeTree()
      ORDER BY (workspace_id, UUIDv7ToDateTime(id), id)
      SETTINGS index_granularity = 8192
    `,
    });
}
//# sourceMappingURL=001_audit.js.map