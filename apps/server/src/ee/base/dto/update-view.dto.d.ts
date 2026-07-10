import { BaseViewTypeValue } from '../base.schemas';
export declare class UpdateViewDto {
    viewId: string;
    pageId: string;
    name?: string;
    type?: BaseViewTypeValue;
    config?: Record<string, unknown>;
    position?: string;
}
export declare class DeleteViewDto {
    viewId: string;
    pageId: string;
}
