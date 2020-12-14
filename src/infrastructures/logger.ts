import winston, { format } from "winston";

class Logger {
    private _log: winston.Logger | undefined;

    get log() {
        if (!this._log) {
            this._log = winston.createLogger({
                format: format.combine(format.timestamp(), format.json()),
                transports: [new winston.transports.Console()],
            });
        }
        return this._log;
    }

    initialize(opts: winston.LoggerOptions) {
        this._log = winston.createLogger(opts);
    }
}

export default new Logger();
