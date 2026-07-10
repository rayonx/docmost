"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScimExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const scimmy_1 = require("scimmy");
let ScimExceptionFilter = class ScimExceptionFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        if (exception instanceof common_1.HttpException) {
            const body = exception.getResponse();
            if (typeof body === 'object' && body !== null && 'schemas' in body) {
                response.status(exception.getStatus()).send(body);
                return;
            }
        }
        let status;
        let detail;
        if (exception instanceof scimmy_1.default.Types.Error) {
            status = exception.status;
            detail = exception.message;
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            detail = exception.message;
        }
        else if (exception instanceof Error) {
            status = 500;
            detail = exception.message;
        }
        else {
            status = 500;
            detail = 'Internal server error';
        }
        const scimBody = {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            status: String(status),
            detail,
        };
        response.status(status).send(scimBody);
    }
};
exports.ScimExceptionFilter = ScimExceptionFilter;
exports.ScimExceptionFilter = ScimExceptionFilter = __decorate([
    (0, common_1.Catch)()
], ScimExceptionFilter);
//# sourceMappingURL=scim-exception.filter.js.map