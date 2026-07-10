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
var GoogleSsoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSsoService = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("../../../core/auth/services/token.service");
const session_service_1 = require("../../../core/session/session.service");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
const sso_service_1 = require("./sso.service");
const constants_1 = require("../constants");
const manage_sso_service_1 = require("./manage-sso.service");
const utils_1 = require("../../../database/utils");
const nestjs_kysely_1 = require("nestjs-kysely");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const workspace_service_1 = require("../../../core/workspace/services/workspace.service");
const sso_utils_1 = require("../sso.utils");
const uuid_1 = require("uuid");
const permission_1 = require("../../../common/helpers/types/permission");
const sso_constants_1 = require("../sso.constants");
const audit_events_1 = require("../../../common/events/audit-events");
const audit_service_1 = require("../../../integrations/audit/audit.service");
let GoogleSsoService = GoogleSsoService_1 = class GoogleSsoService {
    constructor(tokenService, sessionService, workspaceRepo, ssoService, manageSsoService, userRepo, workspaceService, db, auditService) {
        this.tokenService = tokenService;
        this.sessionService = sessionService;
        this.workspaceRepo = workspaceRepo;
        this.ssoService = ssoService;
        this.manageSsoService = manageSsoService;
        this.userRepo = userRepo;
        this.workspaceService = workspaceService;
        this.db = db;
        this.auditService = auditService;
        this.logger = new common_1.Logger(GoogleSsoService_1.name);
    }
    async handleCallback(req, res) {
        const profile = req['user'];
        const stateCookieValue = req.cookies[sso_constants_1.GOOGLE_SSO_STATE_KEY];
        res.clearCookie(sso_constants_1.GOOGLE_SSO_STATE_KEY);
        const [state, value] = stateCookieValue.split(',');
        if (value === 'signup') {
            return this.handleWorkspaceCreation(req);
        }
        const workspaceId = value;
        if (!workspaceId || !(0, uuid_1.validate)(workspaceId)) {
            throw new common_1.BadRequestException('Invalid workspace authorization.');
        }
        const workspace = await this.workspaceRepo.findById(workspaceId);
        if (!workspace) {
            throw new common_1.BadRequestException('Authentication failed. Workspace not found');
        }
        const authProvider = await this.ssoService.getGoogleProviderForWorkspace(workspace.id);
        if (!authProvider) {
            throw new common_1.BadRequestException('Google auth provider not found');
        }
        let user;
        try {
            user = await this.ssoService.handleAuthentication({
                workspace,
                profile,
                providerId: authProvider.id,
                providerType: constants_1.SSO_PROVIDER.GOOGLE,
            });
        }
        catch (err) {
            throw err;
        }
        const authToken = await this.sessionService.createSessionAndToken(user);
        const exchangeToken = await this.tokenService.generateExchangeToken(user.id, workspace.id);
        return { workspace, authToken, exchangeToken };
    }
    async handleWorkspaceCreation(req) {
        const profile = req['user'];
        let user = null;
        let workspace = null;
        let authProviderId = null;
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            user = await this.userRepo.insertUser({
                name: profile.name,
                email: profile.email,
                emailVerifiedAt: new Date(),
                password: (0, sso_utils_1.generateRandomPassword)(),
                hasGeneratedPassword: true,
                avatarUrl: profile.photoUrl,
                role: permission_1.UserRole.OWNER,
            }, trx);
            let hostname = undefined;
            if (profile?.hd) {
                const googleDomain = profile.hd.split('.');
                hostname = googleDomain[0];
            }
            const workspaceData = {
                name: hostname ?? 'My workspace',
                hostname: hostname,
            };
            workspace = await this.workspaceService.create(user, workspaceData, trx);
            const authProvider = await this.manageSsoService.createProvider({
                name: 'Google',
                type: constants_1.SSO_PROVIDER.GOOGLE,
                enableSignup: false,
                isEnabled: true,
            }, { workspaceId: workspace.id, creatorId: user.id, trx });
            authProviderId = authProvider.id;
            await trx
                .insertInto('authAccounts')
                .values({
                userId: user.id,
                providerUserId: profile.sub,
                authProviderId: authProvider.id,
                workspaceId: workspace.id,
            })
                .execute();
            user.workspaceId = workspace.id;
        });
        this.auditService.logWithContext({
            event: audit_events_1.AuditEvent.USER_CREATED,
            resourceType: audit_events_1.AuditResource.USER,
            resourceId: user.id,
            changes: {
                after: {
                    name: user.name,
                    email: user.email,
                    role: permission_1.UserRole.OWNER,
                },
            },
            metadata: {
                source: 'google_signup',
                providerId: authProviderId,
            },
        }, {
            workspaceId: workspace.id,
            actorId: user.id,
        });
        const authToken = await this.sessionService.createSessionAndToken(user);
        const exchangeToken = await this.tokenService.generateExchangeToken(user.id, workspace.id);
        return { workspace, authToken, exchangeToken };
    }
};
exports.GoogleSsoService = GoogleSsoService;
exports.GoogleSsoService = GoogleSsoService = GoogleSsoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(7, (0, nestjs_kysely_1.InjectKysely)()),
    __param(8, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        session_service_1.SessionService,
        workspace_repo_1.WorkspaceRepo,
        sso_service_1.SsoService,
        manage_sso_service_1.ManageSsoService,
        user_repo_1.UserRepo,
        workspace_service_1.WorkspaceService, Object, Object])
], GoogleSsoService);
//# sourceMappingURL=google-sso.service.js.map