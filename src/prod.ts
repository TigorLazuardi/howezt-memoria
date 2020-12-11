import app from "./app";
import nodeVault, { VaultOptions } from "node-vault";
import elasticApmNode from "elastic-apm-node";

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

const options: VaultOptions = {
    token: process.env.VAULT_TOKEN,
    endpoint: process.env.VAULT_HOST,
};

const vault = nodeVault(options);

vault.read("kv/howezt-memoria").then((data: HoweztMemoriaConfig) => {
    elasticApmNode.start({
        serverUrl: data.apm.server_url,
        serviceName: data.apm.service_name,
        secretToken: data.apm.secret_token,
    });
    app(data.bot.token);
});

export default {};
