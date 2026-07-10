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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const constants_1 = require("../constants");
const sso_constants_1 = require("../sso.constants");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    constructor(environmentService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'none',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'none',
            callbackURL: environmentService.getAppUrl() + '/api/sso/google/callback',
            scope: ['profile', 'email'],
            state: true,
            store: {
                store(req, state, meta, callback) {
                    callback(null, null);
                },
                verify(req, providedState, callback) {
                    const stateCookieValue = req.cookies[sso_constants_1.GOOGLE_SSO_STATE_KEY];
                    if (!providedState) {
                        return callback(new common_1.BadRequestException('Unable to verify authorization request state.'));
                    }
                    if (stateCookieValue?.split(',')[0] !== providedState) {
                        return callback(new common_1.BadRequestException('Invalid authorization request state.'));
                    }
                    return callback(null, true, stateCookieValue);
                },
            },
            passReqToCallback: true,
        });
    }
    authenticate(req, options) {
        const path = req.originalUrl.split('?')[0];
        const signInPaths = [sso_constants_1.GOOGLE_LOGIN_PATH, sso_constants_1.GOOGLE_SIGNUP_PATH];
        if (signInPaths.includes(path)) {
            const loginState = req.googleLoginState;
            options = {
                ...options,
                state: loginState,
            };
            return super.authenticate(req, options);
        }
        return super.authenticate(req, options);
    }
    async validate(req, accessToken, refreshToken, profile, done) {
        if (!profile?.emails?.[0]?.value) {
            throw new common_1.BadRequestException('Google account email is missing');
        }
        const user = {
            sub: profile.id,
            email: profile.emails?.[0]?.value.toLowerCase(),
            name: profile?.displayName,
            photoUrl: profile?.photos?.[0]?.value,
            hd: profile?.['_json']?.['hd'],
            type: constants_1.SSO_PROVIDER.GOOGLE,
        };
        done(null, user);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map