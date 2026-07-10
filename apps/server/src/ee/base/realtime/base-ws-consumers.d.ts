import { BaseWsService } from './base-ws.service';
import { BaseFormulaRecomputeCompletedEvent, BaseFormulaRecomputeStartedEvent, BasePropertyCreatedEvent, BasePropertyDeletedEvent, BasePropertyReorderedEvent, BasePropertyUpdatedEvent, BaseRowCreatedEvent, BaseRowDeletedEvent, BaseRowsDeletedEvent, BaseRowsUpdatedEvent, BaseRowReorderedEvent, BaseRowUpdatedEvent, BaseSchemaBumpedEvent, BaseViewCreatedEvent, BaseViewDeletedEvent, BaseViewUpdatedEvent } from '../events/base-events';
export declare class BaseWsConsumers {
    private readonly ws;
    private readonly logger;
    constructor(ws: BaseWsService);
    onRowCreated(e: BaseRowCreatedEvent): void;
    onRowUpdated(e: BaseRowUpdatedEvent): void;
    onRowDeleted(e: BaseRowDeletedEvent): void;
    onRowsDeleted(e: BaseRowsDeletedEvent): void;
    onRowReordered(e: BaseRowReorderedEvent): void;
    onPropertyCreated(e: BasePropertyCreatedEvent): void;
    onPropertyUpdated(e: BasePropertyUpdatedEvent): void;
    onPropertyDeleted(e: BasePropertyDeletedEvent): void;
    onPropertyReordered(e: BasePropertyReorderedEvent): void;
    onViewCreated(e: BaseViewCreatedEvent): void;
    onViewUpdated(e: BaseViewUpdatedEvent): void;
    onViewDeleted(e: BaseViewDeletedEvent): void;
    onSchemaBumped(e: BaseSchemaBumpedEvent): void;
    onRowsUpdated(e: BaseRowsUpdatedEvent): void;
    onFormulaRecomputeStarted(e: BaseFormulaRecomputeStartedEvent): void;
    onFormulaRecomputeCompleted(e: BaseFormulaRecomputeCompletedEvent): void;
}
