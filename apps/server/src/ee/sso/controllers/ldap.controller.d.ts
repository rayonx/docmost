import { FastifyReply, FastifyRequest } from 'fastify';
import { Workspace } from "../../../database/types/entity.types";
import { LdapService } from "../services/ldap.service";
import { LdapLoginDto } from "../dto/ldap-login.dto";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { MfaService } from "../../mfa/services/mfa.service";
export declare class LdapController {
    private readonly ldapService;
    private readonly environmentService;
    private readonly mfaService;
    constructor(ldapService: LdapService, environmentService: EnvironmentService, mfaService: MfaService);
    ldapLogin(workspace: Workspace, dto: LdapLoginDto, req: FastifyRequest, res: FastifyReply): Promise<{
        userHasMfa: boolean;
        requiresMfaSetup: boolean;
        isMfaEnforced: boolean;
    }>;
    private setAuthCookie;
}
