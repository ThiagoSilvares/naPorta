import { HttpException } from "@nestjs/common";

export type ExceptionType = "ValidationError" | "UnauthorizedError" | "NotFoundError" | "FatalError";

const STATUS_BY_TYPE: Record<ExceptionType, number> = {
    ValidationError: 400,
    UnauthorizedError: 401,
    NotFoundError: 404,
    FatalError: 500
};

interface ApiExceptionParams {
    exceptionType: ExceptionType;
    message: string;
    details?: any;
}

export class ApiException extends HttpException {
    exceptionType: ExceptionType;

    constructor({ exceptionType, message, details }: ApiExceptionParams) {
        super({ exceptionType, message, ...(details ? { details } : {}) }, STATUS_BY_TYPE[exceptionType]);
        this.exceptionType = exceptionType;
    }
}
