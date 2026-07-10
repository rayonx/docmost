import { OnModuleDestroy } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';
import { KyselyDB } from "../../../database/types/kysely.types";
import { BaseRowRepo } from "../repos/base-row.repo";
import { BasePropertyRepo } from "../repos/base-property.repo";
import { BaseRepo } from "../repos/base.repo";
import { FormulaLockService } from '../formula/formula-lock';
export declare class BaseQueueProcessor extends WorkerHost implements OnModuleDestroy {
    private readonly db;
    private readonly baseRowRepo;
    private readonly basePropertyRepo;
    private readonly baseRepo;
    private readonly eventEmitter;
    private readonly formulaLock;
    private readonly logger;
    constructor(db: KyselyDB, baseRowRepo: BaseRowRepo, basePropertyRepo: BasePropertyRepo, baseRepo: BaseRepo, eventEmitter: EventEmitter2, formulaLock: FormulaLockService);
    process(job: Job): Promise<unknown>;
    private emitSchemaBumped;
    onActive(job: Job): void;
    onError(job: Job): Promise<void>;
    onCompleted(job: Job): void;
    onModuleDestroy(): Promise<void>;
}
