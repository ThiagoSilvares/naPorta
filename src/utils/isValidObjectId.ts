import { ApiException } from "../exceptions/api.exception";
import Logger from "../services/loggers/logger.service";

export const assertValidObjectId = (id: string, eventName: string) => {
    if (/^[0-9a-fA-F]{24}$/.test(id)) return;

    const executionException = new ApiException({
        exceptionType: "ValidationError",
        message: `Invalid orderId: '${id}'`
    });

    Logger.warn({
        event: eventName,
        message: `${executionException.exceptionType} - ${executionException.message}`,
        content: { orderId: id }
    });

    throw executionException;
};
