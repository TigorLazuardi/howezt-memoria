require("dotenv").config();

import app from "./app";
import { ClientOptions } from "minio";
import { initialize } from "./infrastructures/minio";

const token = process.env.BOT_TOKEN || "";

const minioOptions: ClientOptions = {
    endPoint: process.env.MINIO_HOST!,
    port: Number(process.env.MINIO_POST) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
};

initialize(minioOptions);

app(token);

export default {};
