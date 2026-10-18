import { ApiException } from "../exceptions/api.exception";
import Logger from "../services/loggers/logger.service";

export const normalizeDate = (val: string | null, bound: "start" | "end", eventName: string) => {
    if (!val || typeof val !== "string" || !val.trim()) return null;

    const raw = val.trim();
    const dt = new Date(raw);

    if (isNaN(dt.getTime())) {
        const executionException = new ApiException({
            exceptionType: "ValidationError",
            message: `Invalid date in '${bound === "start" ? "from" : "to"}': '${val}'. Use 'YYYY-MM-DD' or ISO-8601.`
        });

        Logger.warn({
            event: eventName,
            message: `${executionException.exceptionType} - ${executionException.message}`,
            content: { param: bound === "start" ? "from" : "to", value: val }
        });

        throw executionException;
    }

    if (raw.length === 10) {
        bound === "start" ? dt.setUTCHours(0, 0, 0, 0) : dt.setUTCHours(23, 59, 59, 999);
    }

    return dt;
};
