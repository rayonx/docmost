import { KyselyDB, KyselyTransaction } from "../../../database/types/kysely.types";
import { BaseRowRepo } from "../repos/base-row.repo";
import { BasePropertyRepo } from "../repos/base-property.repo";
import { IBaseTypeConversionJob } from '../../../integrations/queue/constants/queue.interface';
export declare function isConversionStillPending(basePropertyRepo: BasePropertyRepo, data: Pick<IBaseTypeConversionJob, 'pageId' | 'propertyId' | 'toType' | 'pendingToken'>, trx?: KyselyTransaction): Promise<boolean>;
export declare function processBaseTypeConversion(db: KyselyDB, baseRowRepo: BaseRowRepo, data: IBaseTypeConversionJob, opts?: {
    progress?: (processed: number) => Promise<void> | void;
    trx?: KyselyTransaction;
}): Promise<{
    converted: number;
    cleared: number;
    total: number;
    alreadyConverted: number;
}>;
