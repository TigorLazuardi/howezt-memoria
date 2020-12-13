import app from "./app";
import elasticApmNode from "elastic-apm-node";
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
}

vault.read("kv/howezt-memoria").then((data: HoweztMemoriaConfig) => {
    elasticApmNode.start({
        serverUrl: data.apm.server_url,
        serviceName: data.apm.service_name,
        secretToken: data.apm.secret_token,
    });
    app(data.bot.token);
});

export default {};
