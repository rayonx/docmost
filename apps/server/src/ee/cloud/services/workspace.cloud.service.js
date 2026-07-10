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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceCloudService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const node_crypto_1 = require("node:crypto");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const auth_util_1 = require("../../../core/auth/auth.util");
const constants_1 = require("../../sso/constants");
const utils_1 = require("../../../database/utils");
const signup_service_1 = require("../../../core/auth/services/signup.service");
const manage_sso_service_1 = require("../../sso/services/manage-sso.service");
const token_service_1 = require("../../../core/auth/services/token.service");
const session_service_1 = require("../../../core/session/session.service");
const uuid_1 = require("uuid");
const helpers_1 = require("../../../common/helpers");
const email_providers_1 = require("../utils/email-providers");
const mail_service_1 = require("../../../integrations/mail/mail.service");
const domain_service_1 = require("../../../integrations/environment/domain.service");
const user_token_repo_1 = require("../../../database/repos/user-token/user-token.repo");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const auth_constants_1 = require("../../../core/auth/auth.constants");
const verify_email_email_1 = require("../emails/verify-email-email");
const find_workspaces_email_1 = require("../emails/find-workspaces-email");
let WorkspaceCloudService = class WorkspaceCloudService {
    constructor(signupService, tokenService, sessionService, manageSsoService, mailService, domainService, userTokenRepo, userRepo, environmentService, db) {
        this.signupService = signupService;
        this.tokenService = tokenService;
        this.sessionService = sessionService;
        this.manageSsoService = manageSsoService;
        this.mailService = mailService;
        this.domainService = domainService;
        this.userTokenRepo = userTokenRepo;
        this.userRepo = userRepo;
        this.environmentService = environmentService;
        this.db = db;
    }
    async createWorkspace(dto) {
        let user = null;
        let workspace = null;
        const { hostname, isPublicProvider } = this.getHostnameFromEmail(dto.email);
        const workspaceNameFromName = `${dto.name.trim().split(/\s+/)[0]}'s workspace`;
        const workspaceNameFromHostname = hostname.charAt(0).toUpperCase() + hostname.slice(1);
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            const data = await this.signupService.initialSetup({
                name: dto.name,
                workspaceName: isPublicProvider
                    ? workspaceNameFromName
                    : workspaceNameFromHostname,
                hostname: hostname,
                email: dto.email,
                password: dto.password,
            }, trx);
            await this.manageSsoService.createProvider({
                name: 'Google',
                type: constants_1.SSO_PROVIDER.GOOGLE,
                enableSignup: false,
                isEnabled: true,
            }, { workspaceId: data.workspace.id, creatorId: data.user.id, trx });
            await this.userRepo.updateUser({ emailVerifiedAt: null }, data.user.id, data.workspace.id, trx);
            user = data.user;
            workspace = data.workspace;
        });
        await this.sendVerificationEmail(user, workspace);
        return {
            workspace,
            requiresEmailVerification: true,
            emailSignature: this.signEmail(dto.email, workspace.id),
        };
    }
    async getJoinedWorkspaceList(joinedWorkspaces) {
        let workspaceIds = [];
        try {
            const workspaceList = JSON.parse(joinedWorkspaces);
            if (!Array.isArray(workspaceList) || !workspaceList.length)
                return [];
            workspaceIds = workspaceList.filter(uuid_1.validate);
        }
        catch {
        }
        if (workspaceIds.length === 0)
            return [];
        return await this.db
            .selectFrom('workspaces')
            .select(['id', 'name', 'logo', 'hostname'])
            .where('id', 'in', workspaceIds)
            .execute();
    }
    async sendVerificationEmail(user, workspace) {
        const token = (0, helpers_1.nanoIdGen)(16);
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await trx
                .deleteFrom('userTokens')
                .where('userId', '=', user.id)
                .where('type', '=', auth_constants_1.UserTokenType.EMAIL_VERIFICATION)
                .execute();
            await this.userTokenRepo.insertUserToken({
                token,
                userId: user.id,
                workspaceId: workspace.id,
                expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
                type: auth_constants_1.UserTokenType.EMAIL_VERIFICATION,
            }, { trx });
        });
        const verifyLink = `${this.domainService.getUrl(workspace.hostname)}/verify-email?token=${token}`;
        const emailTemplate = (0, verify_email_email_1.default)({
            username: user.name,
            verifyLink,
        });
        await this.mailService.sendToQueue({
            to: user.email,
            subject: 'Verify your email address',
            template: emailTemplate,
        });
    }
    async verifyEmail(token, workspaceId) {
        const userToken = await this.userTokenRepo.findById(token, workspaceId);
        if (!userToken ||
            userToken.type !== auth_constants_1.UserTokenType.EMAIL_VERIFICATION ||
            userToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired verification link');
        }
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.userRepo.updateUser({ emailVerifiedAt: new Date() }, userToken.userId, workspaceId, trx);
            await this.userTokenRepo.deleteToken(token, trx);
        });
        const user = await this.userRepo.findById(userToken.userId, workspaceId);
        return this.sessionService.createSessionAndToken(user);
    }
    async resendVerificationEmail(email, workspaceId, sig) {
        if (!this.verifyEmailSignature(email, workspaceId, sig)) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        const user = await this.userRepo.findByEmail(email, workspaceId);
        if (!user || user.emailVerifiedAt) {
            return;
        }
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'name', 'hostname'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        if (!workspace)
            return;
        await this.sendVerificationEmail(user, workspace);
    }
    async findWorkspacesByEmail(email) {
        const workspaces = await this.db
            .selectFrom('users')
            .innerJoin('workspaces', 'workspaces.id', 'users.workspaceId')
            .select(['workspaces.id', 'workspaces.name', 'workspaces.hostname'])
            .where((0, kysely_1.sql) `lower(users.email)`, '=', email.toLowerCase())
            .where('users.deactivatedAt', 'is', null)
            .where('users.deletedAt', 'is', null)
            .execute();
        const workspaceInfos = workspaces.map((ws) => ({
            name: ws.name,
            url: this.domainService.getUrl(ws.hostname),
        }));
        const signupUrl = `${this.domainService.getUrl()}/create`;
        const emailTemplate = (0, find_workspaces_email_1.default)({ workspaces: workspaceInfos, signupUrl });
        await this.mailService.sendToQueue({
            to: email,
            subject: 'Your Docmost workspaces',
            template: emailTemplate,
        });
    }
    getHostnameFromEmail(email) {
        const emailDomain = email.toLowerCase().split('@')[1];
        const parts = emailDomain.split('.');
        const name = parts[0];
        if (email_providers_1.PUBLIC_MAIL_PROVIDERS.includes(emailDomain)) {
            return {
                hostname: `workspace-${(0, helpers_1.generateRandomSuffixNumbers)(6)}`,
                isPublicProvider: true,
            };
        }
        return { hostname: name, isPublicProvider: false };
    }
    signEmail(email, workspaceId) {
        return (0, auth_util_1.computeEmailSignature)(email, workspaceId, this.environmentService.getAppSecret());
    }
    verifyEmailSignature(email, workspaceId, sig) {
        const expected = this.signEmail(email, workspaceId);
        const expectedBuf = Buffer.from(expected, 'hex');
        const sigBuf = Buffer.from(sig, 'hex');
        if (expectedBuf.length !== sigBuf.length)
            return false;
        return (0, node_crypto_1.timingSafeEqual)(expectedBuf, sigBuf);
    }
};
exports.WorkspaceCloudService = WorkspaceCloudService;
exports.WorkspaceCloudService = WorkspaceCloudService = __decorate([
    (0, common_1.Injectable)(),
    __param(9, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [signup_service_1.SignupService,
        token_service_1.TokenService,
        session_service_1.SessionService,
        manage_sso_service_1.ManageSsoService,
        mail_service_1.MailService,
        domain_service_1.DomainService,
        user_token_repo_1.UserTokenRepo,
        user_repo_1.UserRepo,
        environment_service_1.EnvironmentService, Object])
], WorkspaceCloudService);
//# sourceMappingURL=workspace.cloud.service.js.map