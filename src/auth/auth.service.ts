import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { ApiException } from "../exceptions/api.exception";
import { PrismaService } from "../prisma/prisma.service";
import Logger from "../services/loggers/logger.service";
import { JwtPayload, LoginRequest, LoginResponse } from "./auth.interfaces";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async login({ email, password }: LoginRequest): Promise<LoginResponse> {
        const user = await this.prisma.user.findUnique({ where: { email } }).catch(error => {
            const executionException = new ApiException({
                exceptionType: "FatalError",
                message: "Error occurred when tried to connect on database and find a user."
            });
            Logger.error({
                event: "auth.login",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { filter: { email }, error }
            });
            throw executionException;
        });

        const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

        if (!user || !validPassword) {
            const executionException = new ApiException({
                exceptionType: "UnauthorizedError",
                message: "Invalid e-mail or password"
            });
            Logger.warn({
                event: "auth.login",
                message: `${executionException.exceptionType} - ${executionException.message}`,
                content: { email }
            });
            throw executionException;
        }

        const payload: JwtPayload = { sub: user.id, email: user.email };

        return {
            accessToken: await this.jwtService.signAsync(payload),
            tokenType: "Bearer",
            expiresIn: process.env.JWT_EXPIRES_IN ?? "1h"
        };
    }
}
