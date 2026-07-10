import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare const clickhouseClientProvider: {
    provide: string;
    useFactory: (environmentService: EnvironmentService) => Promise<import("@clickhouse/client").ClickHouseClient>;
    inject: (typeof EnvironmentService)[];
};
