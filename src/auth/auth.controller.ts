import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { validateSchema } from "../utils/validateSchema";
import { LoginRequest, LoginResponse } from "./auth.interfaces";
import LoginJSONSchema from "./auth.schema.json";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("login")
    @HttpCode(200)
    async login(@Body() body: unknown): Promise<LoginResponse> {
        const data = validateSchema<LoginRequest>(LoginJSONSchema, body, "auth.login");

        return this.authService.login(data);
    }
}
