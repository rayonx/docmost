import { BasePropertyTypeValue } from '../base.schemas';
export declare class UpdatePropertyDto {
    propertyId: string;
    pageId: string;
    name?: string;
    type?: BasePropertyTypeValue;
    typeOptions?: Record<string, unknown>;
    requestId?: string;
}
export declare class DeletePropertyDto {
    propertyId: string;
    pageId: string;
    requestId?: string;
}
export declare class ReorderPropertyDto {
    propertyId: string;
    pageId: string;
    position: string;
    requestId?: string;
}
