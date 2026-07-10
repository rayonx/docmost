import { TokenService } from '../../../core/auth/services/token.service';
import { SessionService } from '../../../core/session/session.service';
import { UserRepo } from "../../../database/repos/user/user.repo";
import { KyselyDB } from "../../../database/types/kysely.types";
export declare class ExchangeService {
    private readonly tokenService;
    private readonly sessionService;
    private readonly userRepo;
    private readonly db;
    private readonly logger;
    constructor(tokenService: TokenService, sessionService: SessionService, userRepo: UserRepo, db: KyselyDB);
    handleExchangeToken(jwtExchangeToken: string, workspaceId: string): Promise<string>;
}
