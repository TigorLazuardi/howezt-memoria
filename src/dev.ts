require("dotenv").config()

import startApp from "./app"
import { ClientOptions } from "minio"
import minio from "@infra/minio"
import mongo from "@infra/mongodb"
import logger from "@infra/logger"

const token = process.env.BOT_TOKEN || ""

const minioOptions: ClientOptions = {
    endPoint: process.env.MINIO_HOST!,
    port: Number(process.env.MINIO_PORT) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
}

minio.initialize(minioOptions)
logger.log.info(`connected to minio`)

mongo
    .initialize()
    .then(() => {
        logger.log.info(`connected to mongodb`)
        return mongo.db.createIndex({
            name: "text",
            filename: "text",
            folder: 1,
        })
    })
    .then(() => logger.log.info(`indexes configured`))
    .catch(logger.log.error)

startApp(token)

export default {}
