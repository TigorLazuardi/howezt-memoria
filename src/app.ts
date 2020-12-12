import discord from "discord.js";
import message from "./message";

export const client = new discord.Client();

client.once("ready", () => {
    console.log("Discord bot running");
    client.user?.setActivity({
        name: "!hm_help",
        type: "PLAYING",
    });
});

export default (token: string) => {
    client.login(token);
};

message(client);

client.on("error", console.error);

process.on("SIGNIT", async () => {
    await client.destroy();
    process.exit(0);
});
