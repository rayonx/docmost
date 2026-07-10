import type { Server, Socket } from 'socket.io';
import { BaseRepo } from "../repos/base.repo";
import { UserRepo } from "../../../database/repos/user/user.repo";
import { BasePresenceService } from './base-presence.service';
import { PageAccessService } from '../../../core/page/page-access/page-access.service';
type BaseOutbound = {
    operation: `base:${string}`;
} & Record<string, unknown>;
export declare class BaseWsService {
    private readonly baseRepo;
    private readonly userRepo;
    private readonly pageAccessService;
    private readonly presence;
    private readonly logger;
    private server;
    constructor(baseRepo: BaseRepo, userRepo: UserRepo, pageAccessService: PageAccessService, presence: BasePresenceService);
    setServer(server: Server): void;
    isBaseEvent(data: any): boolean;
    handleInbound(client: Socket, raw: unknown): Promise<void>;
    emitToBase(pageId: string, payload: BaseOutbound): void;
    handleDisconnect(client: Socket): Promise<void>;
    private subscribe;
    private unsubscribe;
    private handlePresence;
    private handlePresenceLeave;
    private canReadBase;
    private subscriptionsFor;
}
export {};
