import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { AiConfig } from '../drivers/interfaces/ai-config.interface';
import { AiDriver } from "../drivers";
export declare const aiDriverConfigProvider: {
    provide: string;
    useFactory: (environmentService: EnvironmentService) => Promise<AiConfig | null>;
    inject: (typeof EnvironmentService)[];
};
export declare const aiDriverProvider: {
    provide: string;
    useFactory: (config: AiConfig | null) => AiDriver;
    inject: string[];
};
