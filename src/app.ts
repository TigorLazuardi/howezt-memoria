import discord from "discord.js";
import handleMessage from "./message";

export const client = new discord.Client();

client.once("ready", () => {
    console.log("Discord bot running");
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
