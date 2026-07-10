import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ScimExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
