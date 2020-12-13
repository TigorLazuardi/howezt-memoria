require("dotenv").config();

import app from "./app";
import { ClientOptions } from "minio";
import { initialize } from "./infrastructures/minio";
import logger from "./infrastructures/logger";
import winston, { format } from "winston";

const fmt = format.printf(({ level, message, timestamp }) => {
    let msg = `${timestamp} [${level}] ${message} `;
    return msg;
});

logger.log = winston.createLogger({
    format: format.combine(
        format.timestamp({
            format: new Date().toLocaleString(),
        }),
        fmt
    ),
    transports: [new winston.transports.Console()],
});

const token = process.env.BOT_TOKEN || "";

const minioOptions: ClientOptions = {
    endPoint: process.env.MINIO_HOST!,
    port: Number(process.env.MINIO_PORT) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
};

initialize(minioOptions);

app(token);

export default {};
