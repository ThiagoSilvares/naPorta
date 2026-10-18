type LogLevel = "info" | "warn" | "error";

interface LogPayload {
    event: string;
    message: string;
    content?: Record<string, any>;
}

export default class Logger {
    private static write(level: LogLevel, payload: LogPayload) {
        const line = JSON.stringify({
            level,
            timestamp: new Date().toISOString(),
            ...payload
        }, (_key, value) => (value instanceof Error ? { name: value.name, message: value.message, stack: value.stack } : value));

        level === "error" ? console.error(line) : console.log(line);
    }

    static info(payload: LogPayload) {
        Logger.write("info", payload);
    }

    static warn(payload: LogPayload) {
        Logger.write("warn", payload);
    }

    static error(payload: LogPayload) {
        Logger.write("error", payload);
    }
}
