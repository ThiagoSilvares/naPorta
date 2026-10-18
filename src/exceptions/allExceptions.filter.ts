import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";
import Logger from "../services/loggers/logger.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            const payload = typeof body === "string"
                ? { exceptionType: status === 404 ? "NotFoundError" : "ValidationError", message: body } : body;
            return response.status(status).json(payload);
        }

        Logger.error({
            event: "http.unhandledException",
            message: "FatalError - Unhandled exception",
            content: { error: exception }
        });

        return response.status(500).json({
            exceptionType: "FatalError",
            message: "Internal server error"
        });
    }
}
