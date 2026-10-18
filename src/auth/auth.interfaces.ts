export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: "Bearer";
    expiresIn: string;
}

export interface JwtPayload {
    sub: string;
    email: string;
}
