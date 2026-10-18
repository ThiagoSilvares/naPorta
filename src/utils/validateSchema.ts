import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvKeywords from "ajv-keywords";
import { ApiException } from "../exceptions/api.exception";
import Logger from "../services/loggers/logger.service";

const ajv = new Ajv({
    allErrors: true,
    useDefaults: true,
    coerceTypes: "array",
    removeAdditional: "all"
});

addFormats(ajv);
ajvKeywords(ajv, "transform");

export function validateSchema<T>(schema: object, data: any, event: string): T {
    const payload = JSON.parse(JSON.stringify(data ?? {}));
    const validate = ajv.compile(schema);

    if (!validate(payload)) {
        const errors = (validate.errors ?? []).map(error => ({
            field: error.instancePath || (error.params as any)?.missingProperty || "(root)",
            message: error.message
        }));

        const executionException = new ApiException({
            exceptionType: "ValidationError",
            message: "Invalid request data",
            details: errors
        });

        Logger.warn({
            event,
            message: `${executionException.exceptionType} - ${executionException.message}`,
            content: { errors }
        });

        throw executionException;
    }

    return payload as T;
}
