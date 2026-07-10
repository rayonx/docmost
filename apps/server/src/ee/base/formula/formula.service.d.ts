import { Queue } from "bullmq";
import { type FormulaTypeOptions, type Value } from "@docmost/base-formula/server";
import { IBaseFormulaRecomputeJob } from "../../../integrations/queue/constants/queue.interface";
import { BaseProperty } from "../../../database/types/entity.types";
export declare class FormulaService {
    private readonly queue;
    private readonly logger;
    constructor(queue: Queue);
    get inlineThreshold(): number;
    compile(source: string, properties: BaseProperty[]): FormulaTypeOptions;
    detectCycle(candidate: BaseProperty, allProperties: BaseProperty[]): string[] | null;
    evaluateInline(args: {
        properties: BaseProperty[];
        row: Record<string, unknown>;
        dirtyProps: string[] | "all";
    }): Record<string, Value>;
    enqueueRecompute(args: IBaseFormulaRecomputeJob): Promise<void>;
    private buildPropertyLookup;
}
