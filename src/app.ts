if (process.env.NODE_ENV === "development") require("dotenv").config()

import logger from "@infra/logger"
import minio from "@infra/minio"
import mongo from "@infra/mongodb"
import { index } from "@repo/mongodb"
import { ClientOptions } from "minio"
import startApp from "./discord"

const token = process.env.BOT_TOKEN || ""

const minioOptions: ClientOptions = {
    endPoint: process.env.MINIO_HOST!,
    port: Number(process.env.MINIO_PORT) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
    useSSL: false,
}

minio.initialize(minioOptions)
logger.log.info(`connected to minio`)

mongo
    .initialize()
    .catch((err) => {
        logger.log.emerg(err)
        process.exit(1)
    })
    .then(() => {
        logger.log.info(`connected to mongodb`)
        return index()
    })
    .catch(logger.log.error)
    .then(() => logger.log.info(`indexes configured`))

startApp(token)

export default {}
