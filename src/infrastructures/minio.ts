import Minio, { Client, ClientOptions } from "minio";

let minioClient: Client;

export function initialize(opt: ClientOptions) {
    minioClient = new Minio.Client(opt);
}

export default () => minioClient;
