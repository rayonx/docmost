import { BaseRowRepo } from "../repos/base-row.repo";
import { BasePropertyRepo } from "../repos/base-property.repo";
import { KyselyDB } from "../../../database/types/kysely.types";
import { IBaseCellGcJob } from '../../../integrations/queue/constants/queue.interface';
export declare function processBaseCellGc(db: KyselyDB, baseRowRepo: BaseRowRepo, basePropertyRepo: BasePropertyRepo, data: IBaseCellGcJob): Promise<void>;
