import discord from "discord.js";
import logger from "./infrastructures/logger";
import handleMessage from "./message";

export const client = new discord.Client();

client.once("ready", () => {
    logger.log.info("discord bot running");
    client.user?.setPresence({
        status: "online",
        activity: {
            name: "Ping this bot for help",
        },
    });
});

export default (token: string) => {
    client.login(token);
};

handleMessage(client);

client.on("error", console.error);

process.on("SIGINT", () => {
    client.destroy();
    process.exit(0);
});
