import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiException } from "../exceptions/api.exception";
import Logger from "../services/loggers/logger.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    handleRequest(error: any, user: any, info: any) {
        if (error || !user) {
            const executionException = new ApiException({
                exceptionType: "UnauthorizedError",
                message: "Missing or invalid Bearer token"
            });
            Logger.warn({
                event: "auth.guard",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { reason: info?.message }
            });
            throw executionException;
        }

        return user;
    }
}
