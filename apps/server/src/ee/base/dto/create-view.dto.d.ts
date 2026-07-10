import { BaseViewTypeValue } from '../base.schemas';
export declare class CreateViewDto {
    pageId: string;
    name: string;
    type?: BaseViewTypeValue;
    config?: Record<string, unknown>;
}
