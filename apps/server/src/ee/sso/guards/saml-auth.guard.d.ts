import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SsoService } from "../services/sso.service";
declare const SamlAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class SamlAuthGuard extends SamlAuthGuard_base {
    private readonly ssoService;
    private logger;
    constructor(ssoService: SsoService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    handleRequest(err: any, user: any): any;
    private toUserMessage;
}
export {};
