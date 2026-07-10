import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { SsoService } from "../services/sso.service";
declare const GoogleAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleAuthGuard extends GoogleAuthGuard_base {
    private readonly environmentService;
    private readonly ssoService;
    constructor(environmentService: EnvironmentService, ssoService: SsoService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status: any): any;
}
export {};
