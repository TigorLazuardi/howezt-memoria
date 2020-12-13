import { Client, ClientOptions } from "minio";

let minioClient: Client;

export function initialize(opt: ClientOptions) {
    minioClient = new Client(opt);
    console.log("connected to minio");
}

export default () => minioClient;
