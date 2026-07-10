import { User, Workspace } from "../../../database/types/entity.types";
import { SsoService } from "./sso.service";
export declare class LdapService {
    private readonly ssoService;
    private readonly logger;
    constructor(ssoService: SsoService);
    authenticate(opts: {
        username: string;
        password: string;
        workspace: Workspace;
        providerId: string;
    }): Promise<User>;
    private authenticateUser;
    private formatLdapProfile;
}
