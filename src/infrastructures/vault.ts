import nodeVault, { VaultOptions } from "node-vault";

const options: VaultOptions = {
    token: process.env.VAULT_TOKEN,
    endpoint: process.env.VAULT_HOST,
};

const vault = nodeVault(options);

export default vault;
