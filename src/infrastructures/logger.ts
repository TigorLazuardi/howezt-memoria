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

    set log(v: winston.Logger) {
        this._log = v;
    }
}

export default new Logger();
