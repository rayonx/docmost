import { OnModuleInit } from '@nestjs/common';
import { AttachmentEeService } from "./attachment-ee.service";
export declare class AttachmentEeModule implements OnModuleInit {
    private readonly attachmentEeService;
    constructor(attachmentEeService: AttachmentEeService);
    onModuleInit(): Promise<void>;
}
