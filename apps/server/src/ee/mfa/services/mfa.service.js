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
exports.MfaService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const OTPAuth = require("otpauth");
const QRCode = require("qrcode");
const bcrypt = require("bcrypt");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const token_service_1 = require("../../../core/auth/services/token.service");
const session_service_1 = require("../../../core/session/session.service");
const helpers_1 = require("../../../common/helpers");
const auth_util_1 = require("../../../core/auth/auth.util");
const jwt_payload_1 = require("../../../core/auth/dto/jwt-payload");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const mfa_util_1 = require("../mfa.util");
const date_fns_1 = require("date-fns");
let MfaService = class MfaService {
    constructor(db, environmentService, tokenService, sessionService, userRepo) {
        this.db = db;
        this.environmentService = environmentService;
        this.tokenService = tokenService;
        this.sessionService = sessionService;
        this.userRepo = userRepo;
    }
    async getUserMfa(userId, opts) {
        const { includeBackupCodes, includeSecret } = opts || {};
        let query = this.db
            .selectFrom('userMfa')
            .select([
            'id',
            'userId',
            'method',
            'isEnabled',
            'workspaceId',
            'createdAt',
            'updatedAt',
        ])
            .where('userId', '=', userId);
        if (includeBackupCodes) {
            query = query.select('backupCodes');
        }
        if (includeSecret) {
            query = query.select('secret');
        }
        return query.executeTakeFirst();
    }
    async setupMfa(userId, workspaceId, email, workspaceName) {
        const existingMfa = await this.getUserMfa(userId);
        if (existingMfa?.isEnabled) {
            throw new common_1.BadRequestException('MFA is already enabled');
        }
        const { secret, qrCode, manualKey } = await this.generateTOTPSecret(email, workspaceName);
        if (existingMfa) {
            await this.db
                .updateTable('userMfa')
                .set({
                method: mfa_util_1.MfaMethod.TOTP,
                secret,
                isEnabled: false,
                backupCodes: null,
                updatedAt: new Date(),
            })
                .where('userId', '=', userId)
                .execute();
        }
        else {
            await this.db
                .insertInto('userMfa')
                .values({
                userId,
                method: mfa_util_1.MfaMethod.TOTP,
                secret,
                isEnabled: false,
                backupCodes: null,
                workspaceId,
            })
                .execute();
        }
        return { qrCode, manualKey };
    }
    async enableMfa(userId, verificationCode) {
        const existingMfa = await this.getUserMfa(userId, { includeSecret: true });
        const enablement = (0, mfa_util_1.resolveMfaEnablement)(existingMfa);
        if (enablement.canEnable === false) {
            if (enablement.reason === 'already_enabled') {
                throw new common_1.BadRequestException('MFA is already enabled');
            }
            throw new common_1.BadRequestException('MFA setup has not been initiated');
        }
        if (!this.verifyTOTPToken({
            mfaSecret: enablement.secret,
            code: verificationCode,
        })) {
            throw new common_1.BadRequestException('Invalid verification code');
        }
        const backupCodes = (0, mfa_util_1.generateBackupCodes)();
        const hashedBackupCodes = await (0, mfa_util_1.hashBackupCodes)(backupCodes);
        await this.db
            .updateTable('userMfa')
            .set({
            isEnabled: true,
            backupCodes: hashedBackupCodes,
            updatedAt: new Date(),
        })
            .where('userId', '=', userId)
            .execute();
        return { backupCodes };
    }
    async disableMfa(userId) {
        await this.db.deleteFrom('userMfa').where('userId', '=', userId).execute();
    }
    async isMfaEnabled(userId) {
        const userMfa = await this.getUserMfa(userId);
        return userMfa?.isEnabled || false;
    }
    async generateTOTPSecret(email, workspaceName) {
        const truncatedWorkspaceName = workspaceName.substring(0, 20);
        const totp = new OTPAuth.TOTP({
            issuer: `Docmost: ${truncatedWorkspaceName}`,
            label: email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32((0, mfa_util_1.generateMfaSecret)()),
        });
        const mfaSecret = totp.secret.base32;
        const uri = totp.toString();
        const qrCode = await QRCode.toDataURL(uri);
        return {
            secret: (0, mfa_util_1.encryptSecret)({
                mfaSecret,
                appSecret: this.environmentService.getAppSecret(),
            }),
            qrCode,
            manualKey: mfaSecret,
        };
    }
    verifyTOTPToken(opts) {
        const { mfaSecret, code } = opts;
        try {
            const decryptedSecret = (0, mfa_util_1.decryptSecret)({
                mfaSecret,
                appSecret: this.environmentService.getAppSecret(),
            });
            const totp = new OTPAuth.TOTP({
                secret: OTPAuth.Secret.fromBase32(decryptedSecret),
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
            });
            const delta = totp.validate({ token: code, window: 1 });
            return delta !== null;
        }
        catch (error) {
            return false;
        }
    }
    async verifyBackupCode(opts) {
        const { userId, code } = opts;
        const userMfa = await this.getUserMfa(userId, { includeBackupCodes: true });
        if (!userMfa || !userMfa.backupCodes) {
            return false;
        }
        for (let i = 0; i < userMfa.backupCodes.length; i++) {
            const hashedCode = userMfa.backupCodes[i];
            const isValid = await bcrypt.compare(code.toUpperCase(), hashedCode);
            if (isValid) {
                const newBackupCodes = [...userMfa.backupCodes];
                newBackupCodes.splice(i, 1);
                await this.db
                    .updateTable('userMfa')
                    .set({
                    backupCodes: newBackupCodes,
                    updatedAt: new Date(),
                })
                    .where('userId', '=', userId)
                    .execute();
                return true;
            }
        }
        return false;
    }
    async regenerateBackupCodes(userId) {
        const userMfa = await this.getUserMfa(userId);
        if (!userMfa || !userMfa.isEnabled) {
            throw new common_1.BadRequestException('MFA is not enabled');
        }
        const backupCodes = (0, mfa_util_1.generateBackupCodes)();
        const hashedBackupCodes = await (0, mfa_util_1.hashBackupCodes)(backupCodes);
        await this.db
            .updateTable('userMfa')
            .set({
            backupCodes: hashedBackupCodes,
            updatedAt: new Date(),
        })
            .where('userId', '=', userId)
            .execute();
        return { backupCodes };
    }
    async verifyMfaCode(userId, code) {
        const userMfa = await this.getUserMfa(userId, { includeSecret: true });
        if (!userMfa || !userMfa.isEnabled) {
            return false;
        }
        if (code.length === 8) {
            return this.verifyBackupCode({ userId, code });
        }
        if (userMfa.secret && code.length === 6) {
            return this.verifyTOTPToken({ mfaSecret: userMfa.secret, code });
        }
        return false;
    }
    async verifyMfa(opts) {
        const { code, workspaceId, req } = opts;
        const mfaToken = req.cookies?.mfaToken;
        if (!mfaToken) {
            throw new common_1.UnauthorizedException('Invalid or missing MFA transfer token');
        }
        let payload = null;
        try {
            payload = await this.tokenService.verifyJwt(mfaToken, jwt_payload_1.JwtType.MFA_TOKEN);
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid or expired MFA transfer token');
        }
        const userId = payload.sub;
        const isValid = await this.verifyMfaCode(userId, code);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid MFA code');
        }
        if (workspaceId !== payload.workspaceId) {
            throw new common_1.UnauthorizedException('Workspace does not match');
        }
        const user = await this.userRepo.findById(userId, workspaceId);
        if (!user || (0, helpers_1.isUserDisabled)(user)) {
            throw new common_1.UnauthorizedException();
        }
        (0, auth_util_1.throwIfEmailNotVerified)({
            isCloud: this.environmentService.isCloud(),
            emailVerifiedAt: user.emailVerifiedAt,
            email: user.email,
            workspaceId,
            appSecret: this.environmentService.getAppSecret(),
        });
        const authToken = await this.sessionService.createSessionAndToken(user);
        await this.userRepo.updateLastLogin(user.id, workspaceId);
        return { authToken, userId: user.id };
    }
    async loginWithMfaCheck(loginDto, workspaceId, isLdap) {
        const user = await this.userRepo.findByEmail(loginDto.email, workspaceId, {
            includePassword: true,
            includeUserMfa: true,
        });
        const errorMessage = 'Email or password does not match';
        if (!user || (0, helpers_1.isUserDisabled)(user)) {
            throw new common_1.UnauthorizedException(errorMessage);
        }
        if (!isLdap) {
            const isPasswordMatch = await (0, helpers_1.comparePasswordHash)(loginDto.password, user.password);
            if (!isPasswordMatch) {
                throw new common_1.UnauthorizedException(errorMessage);
            }
        }
        (0, auth_util_1.throwIfEmailNotVerified)({
            isCloud: this.environmentService.isCloud(),
            emailVerifiedAt: user.emailVerifiedAt,
            email: user.email,
            workspaceId,
            appSecret: this.environmentService.getAppSecret(),
        });
        const mfaEnabled = user?.['mfa']?.isEnabled || false;
        if (mfaEnabled) {
            const mfaToken = await this.tokenService.generateMfaToken(user, workspaceId);
            return {
                userHasMfa: true,
                mfaToken,
                user,
                userMfa: user?.['mfa'],
            };
        }
        return {
            userHasMfa: mfaEnabled,
            user,
            userMfa: user?.['mfa'],
        };
    }
    async checkMfaRequirements(loginDto, workspace, res, isLdap) {
        const isMfaEnforced = workspace.enforceMfa || false;
        const result = await this.loginWithMfaCheck(loginDto, workspace.id, isLdap);
        if (result.userHasMfa && result.mfaToken) {
            const { mfaToken } = result;
            this.setMfaTokenCookie(mfaToken, res);
            return {
                userHasMfa: result.userHasMfa,
                requiresMfaSetup: false,
                isMfaEnforced: isMfaEnforced,
                mfaToken,
            };
        }
        if (isMfaEnforced && !result.userHasMfa) {
            const { user } = result;
            const mfaToken = await this.tokenService.generateMfaToken(user, workspace.id);
            this.setMfaTokenCookie(mfaToken, res);
            return {
                userHasMfa: result.userHasMfa,
                requiresMfaSetup: true,
                isMfaEnforced: true,
                mfaToken,
            };
        }
        const authToken = await this.sessionService.createSessionAndToken(result.user);
        await this.userRepo.updateLastLogin(result.user.id, workspace.id);
        res.clearCookie('mfaToken');
        return {
            userHasMfa: false,
            requiresMfaSetup: false,
            isMfaEnforced: false,
            authToken,
        };
    }
    setMfaTokenCookie(mfaToken, res) {
        res.setCookie('mfaToken', mfaToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: this.environmentService.isHttps(),
            expires: (0, date_fns_1.addMinutes)(new Date(), 5),
        });
    }
};
exports.MfaService = MfaService;
exports.MfaService = MfaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, environment_service_1.EnvironmentService,
        token_service_1.TokenService,
        session_service_1.SessionService,
        user_repo_1.UserRepo])
], MfaService);
//# sourceMappingURL=mfa.service.js.map