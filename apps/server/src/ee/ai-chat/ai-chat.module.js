"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatModule = void 0;
const common_1 = require("@nestjs/common");
const ai_chat_controller_1 = require("./ai-chat.controller");
const ai_chat_service_1 = require("./ai-chat.service");
const ai_chat_repo_1 = require("./ai-chat.repo");
const ai_chat_tools_service_1 = require("./ai-chat-tools.service");
const ai_chat_enabled_guard_1 = require("./guards/ai-chat-enabled.guard");
const page_module_1 = require("../../core/page/page.module");
const search_module_1 = require("../../core/search/search.module");
const space_module_1 = require("../../core/space/space.module");
const ai_module_1 = require("../ai/ai.module");
const attachment_ee_module_1 = require("../attachments-ee/attachment-ee.module");
const typesense_module_1 = require("../typesense/typesense.module");
let AiChatModule = class AiChatModule {
};
exports.AiChatModule = AiChatModule;
exports.AiChatModule = AiChatModule = __decorate([
    (0, common_1.Module)({
        imports: [page_module_1.PageModule, search_module_1.SearchModule, space_module_1.SpaceModule, ai_module_1.AiModule, attachment_ee_module_1.AttachmentEeModule, typesense_module_1.TypesenseModule],
        controllers: [ai_chat_controller_1.AiChatController],
        providers: [ai_chat_service_1.AiChatService, ai_chat_repo_1.AiChatRepo, ai_chat_tools_service_1.AiChatToolsService, ai_chat_enabled_guard_1.AiChatEnabledGuard],
    })
], AiChatModule);
//# sourceMappingURL=ai-chat.module.js.map