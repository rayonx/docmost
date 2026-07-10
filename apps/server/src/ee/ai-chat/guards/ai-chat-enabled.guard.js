"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatEnabledGuard = void 0;
const common_1 = require("@nestjs/common");
let AiChatEnabledGuard = class AiChatEnabledGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const workspace = request.raw?.workspace ?? request?.user?.workspace;
        if (workspace?.settings?.['ai']?.['chat'] !== true) {
            throw new common_1.ForbiddenException('AI Chat is not enabled for this workspace');
        }
        return true;
    }
};
exports.AiChatEnabledGuard = AiChatEnabledGuard;
exports.AiChatEnabledGuard = AiChatEnabledGuard = __decorate([
    (0, common_1.Injectable)()
], AiChatEnabledGuard);
//# sourceMappingURL=ai-chat-enabled.guard.js.map