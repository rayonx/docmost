"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BaseWsConsumers_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseWsConsumers = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_contants_1 = require("../../../common/events/event.contants");
const base_ws_service_1 = require("./base-ws.service");
let BaseWsConsumers = BaseWsConsumers_1 = class BaseWsConsumers {
    constructor(ws) {
        this.ws = ws;
        this.logger = new common_1.Logger(BaseWsConsumers_1.name);
    }
    onRowCreated(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:row:created',
            pageId: e.pageId,
            row: e.row,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onRowUpdated(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:row:updated',
            pageId: e.pageId,
            rowId: e.rowId,
            patch: e.patch,
            updatedCells: e.updatedCells,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onRowDeleted(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:row:deleted',
            pageId: e.pageId,
            rowId: e.rowId,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onRowsDeleted(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:rows:deleted',
            pageId: e.pageId,
            rowIds: e.rowIds,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onRowReordered(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:row:reordered',
            pageId: e.pageId,
            rowId: e.rowId,
            position: e.position,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onPropertyCreated(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:property:created',
            pageId: e.pageId,
            property: e.property,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onPropertyUpdated(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:property:updated',
            pageId: e.pageId,
            property: e.property,
            schemaVersion: e.schemaVersion,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onPropertyDeleted(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:property:deleted',
            pageId: e.pageId,
            propertyId: e.propertyId,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onPropertyReordered(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:property:reordered',
            pageId: e.pageId,
            propertyId: e.propertyId,
            position: e.position,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onViewCreated(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:view:created',
            pageId: e.pageId,
            view: e.view,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onViewUpdated(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:view:updated',
            pageId: e.pageId,
            view: e.view,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onViewDeleted(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:view:deleted',
            pageId: e.pageId,
            viewId: e.viewId,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onSchemaBumped(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:schema:bumped',
            pageId: e.pageId,
            schemaVersion: e.schemaVersion,
        });
    }
    onRowsUpdated(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:rows:updated',
            pageId: e.pageId,
            rowIds: e.rowIds,
            propertyIds: e.propertyIds,
            actorId: e.actorId ?? null,
            requestId: e.requestId ?? null,
        });
    }
    onFormulaRecomputeStarted(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:formula:recompute:started',
            pageId: e.pageId,
            propertyIds: e.propertyIds,
            jobId: e.jobId,
            actorId: e.actorId ?? null,
        });
    }
    onFormulaRecomputeCompleted(e) {
        this.ws.emitToBase(e.pageId, {
            operation: 'base:formula:recompute:completed',
            pageId: e.pageId,
            propertyIds: e.propertyIds,
            jobId: e.jobId,
            processed: e.processed,
            errored: e.errored,
            actorId: e.actorId ?? null,
        });
    }
};
exports.BaseWsConsumers = BaseWsConsumers;
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_ROW_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onRowCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_ROW_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onRowUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_ROW_DELETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onRowDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_ROWS_DELETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onRowsDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_ROW_REORDERED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onRowReordered", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_PROPERTY_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onPropertyCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_PROPERTY_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onPropertyUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_PROPERTY_DELETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onPropertyDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_PROPERTY_REORDERED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onPropertyReordered", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_VIEW_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onViewCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_VIEW_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onViewUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_VIEW_DELETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onViewDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_SCHEMA_BUMPED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onSchemaBumped", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_ROWS_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onRowsUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_FORMULA_RECOMPUTE_STARTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onFormulaRecomputeStarted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.BASE_FORMULA_RECOMPUTE_COMPLETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseWsConsumers.prototype, "onFormulaRecomputeCompleted", null);
exports.BaseWsConsumers = BaseWsConsumers = BaseWsConsumers_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [base_ws_service_1.BaseWsService])
], BaseWsConsumers);
//# sourceMappingURL=base-ws-consumers.js.map