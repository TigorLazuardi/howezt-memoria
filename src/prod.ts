import app from "./app";
import minio from "./infrastructures/minio";
import vault from "./infrastructures/vault";

interface HoweztMemoriaConfig {
    bot: {
        token: string;
    };
    apm: {
        service_name: string;
        secret_token?: string;
        server_url: string;
    };
    minio: {
        host: string;
        port: number;
        access_key: string;
        secret_key: string;
    };
}

vault.read("kv/howezt-memoria").then((data: HoweztMemoriaConfig) => {
    app(data.bot.token);
    minio.initialize({
        endPoint: data.minio.host,
        accessKey: data.minio.access_key,
        port: data.minio.port,
        secretKey: data.minio.access_key,
    });
});

export default {};
