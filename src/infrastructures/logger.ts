import winston, { format } from "winston";
import "winston-daily-rotate-file";

class Logger {
    private _log: winston.Logger | undefined;

    get log() {
        if (!this._log) {
            const fmt = format.printf(({ level, message, timestamp }) => {
                let msg = `${timestamp} [${level}] ${message} `;
                return msg;
            });
            this._log = winston.createLogger({
                format: format.combine(
                    format.timestamp({
                        format: new Date().toLocaleString(),
                    }),
                    fmt
                ),
                transports: [
                    new winston.transports.Console(),
                    new winston.transports.DailyRotateFile({
                        filename: "logs/%DATE%.log",
                        datePattern: "YYYY-MM-DD",
                        maxFiles: "14d",
                        createSymlink: true,
                    }),
                ],
            });
        }
        return this._log;
    }

    initialize(opts: winston.LoggerOptions) {
        this._log = winston.createLogger(opts);
    }
}

export default new Logger();
