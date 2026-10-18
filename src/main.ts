import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./exceptions/allExceptions.filter";
import Logger from "./services/loggers/logger.service";

async function bootstrap() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is required. Copy .env.example to .env and fill it.");
    }

    const app = await NestFactory.create(AppModule, { logger: ["error", "warn"] });
    app.useGlobalFilters(new AllExceptionsFilter());

    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);

    Logger.info({ event: "app.bootstrap", message: `API running on http://localhost:${port}` });
}

bootstrap();
