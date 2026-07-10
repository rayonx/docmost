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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FormulaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const server_1 = require("@docmost/base-formula/server");
const constants_1 = require("../../../integrations/queue/constants");
const server_2 = require("@docmost/base-formula/server");
const formula_constants_1 = require("./formula.constants");
const property_type_registry_1 = require("../property-types/property-type.registry");
let FormulaService = FormulaService_1 = class FormulaService {
    constructor(queue) {
        this.queue = queue;
        this.logger = new common_1.Logger(FormulaService_1.name);
    }
    get inlineThreshold() { return formula_constants_1.FORMULA_INLINE_ROW_THRESHOLD; }
    compile(source, properties) {
        const nameToId = new Map(properties.map((p) => [p.name, p.id]));
        try {
            const raw = (0, server_1.parseRaw)(source);
            const resolved = (0, server_1.resolve)(raw, nameToId);
            const typeMap = new Map(properties.map((p) => [p.id, propResultType(p)]));
            const { resultType } = (0, server_1.typecheck)(resolved.ast, typeMap, server_1.registry);
            return {
                source,
                ast: resolved.ast,
                resultType,
                dependencies: resolved.dependencies,
                astVersion: 1,
            };
        }
        catch (e) {
            if (e instanceof server_2.FormulaParseError) {
                throw new common_1.BadRequestException({ message: "Invalid formula", errors: e.errors });
            }
            throw e;
        }
    }
    detectCycle(candidate, allProperties) {
        const others = allProperties.filter((p) => p.id !== candidate.id);
        const graph = new server_1.BaseFormulaGraph([...others, candidate]);
        return graph.detectCycle(candidate);
    }
    evaluateInline(args) {
        const graph = new server_1.BaseFormulaGraph(args.properties);
        const affected = args.dirtyProps === "all"
            ? args.properties.filter((p) => p.type === "formula").map((p) => p.id)
            : graph.affectedFormulas(args.dirtyProps);
        if (affected.length === 0)
            return {};
        const ctx = {
            registry: server_1.registry,
            properties: this.buildPropertyLookup(args.properties),
            depth: 0,
            maxDepth: server_1.DEFAULT_MAX_DEPTH,
            memo: new Map(),
        };
        const order = graph.evalOrder().filter((id) => affected.includes(id));
        const patch = {};
        for (const propId of order) {
            const prop = args.properties.find((p) => p.id === propId);
            if (!prop || prop.type !== "formula")
                continue;
            const opts = prop.typeOptions;
            try {
                const result = (0, server_1.evaluate)(opts.ast, { ...args.row, ...patch }, ctx);
                patch[propId] = typeof result === "number" ? (0, server_1.snapNumber)(result) : result;
            }
            catch (e) {
                patch[propId] = (0, server_1.makeErrorCell)("TYPE_MISMATCH", e.message);
            }
        }
        return patch;
    }
    async enqueueRecompute(args) {
        if (!args.rowIds) {
            const waiting = await this.queue.getJobs(["waiting", "delayed"]);
            const covered = waiting.some((job) => job?.name === constants_1.QueueJob.BASE_FORMULA_RECOMPUTE &&
                job.data?.pageId === args.pageId &&
                !job.data?.rowIds &&
                args.propertyIds.every((id) => (job.data.propertyIds ?? []).includes(id)));
            if (covered)
                return;
        }
        await this.queue.add(constants_1.QueueJob.BASE_FORMULA_RECOMPUTE, args, {
            removeOnComplete: 1000,
            removeOnFail: 1000,
        });
    }
    buildPropertyLookup(props) {
        return new Map(props.map((p) => [p.id, {
                id: p.id,
                type: p.type,
                typeOptions: p.typeOptions,
            }]));
    }
};
exports.FormulaService = FormulaService;
exports.FormulaService = FormulaService = FormulaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(constants_1.QueueName.BASE_QUEUE)),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], FormulaService);
function propResultType(p) {
    if (p.type === "formula") {
        return p.typeOptions?.resultType ?? "null";
    }
    return (0, property_type_registry_1.formulaResultType)(p.type);
}
//# sourceMappingURL=formula.service.js.map