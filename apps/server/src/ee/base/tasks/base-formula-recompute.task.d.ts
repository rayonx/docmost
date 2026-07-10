import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { BaseRowRepo } from "../repos/base-row.repo";
import { BasePropertyRepo } from "../repos/base-property.repo";
import { type Value } from "@docmost/base-formula/server";
import { IBaseFormulaRecomputeJob } from "../../../integrations/queue/constants/queue.interface";
export declare function processBaseFormulaRecompute(db: KyselyDB, baseRowRepo: BaseRowRepo, basePropertyRepo: BasePropertyRepo, data: IBaseFormulaRecomputeJob, opts?: {
    progress?: (processed: number) => Promise<void> | void;
    onBatch?: (batch: Array<{
        id: string;
        patch: Record<string, Value>;
    }>) => Promise<void> | void;
    trx?: KyselyTransaction;
}): Promise<{
    processed: number;
    errored: number;
}>;
