import { Client, ClientOptions } from "minio";
import logger from "./logger";

let minioClient: Client;

export function initialize(opt: ClientOptions) {
    minioClient = new Client(opt);
    logger.log.info("connected to minio");
}

export default () => minioClient;
