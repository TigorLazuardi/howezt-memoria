import startApp from "./app";
import minio from "./infrastructures/minio";
import mongo from "./infrastructures/mongodb";
import vault from "./infrastructures/vault";

interface HoweztMemoriaConfig {
    bot: {
        token: string;
    };
    minio: {
        host: string;
        port: number;
        access_key: string;
        secret_key: string;
    };
    mongo: {
        uri: string;
    };
}

vault.read("kv/howezt-memoria").then((data: HoweztMemoriaConfig) => {
    minio.initialize({
        endPoint: data.minio.host,
        accessKey: data.minio.access_key,
        port: data.minio.port,
        secretKey: data.minio.access_key,
    });
    mongo.initialize(data.mongo.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    startApp(data.bot.token);
});

export default {};
