import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AiChatEnabledGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
