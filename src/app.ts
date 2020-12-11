import discord from "discord.js";
import message from "./message";

export const client = new discord.Client();

client.once("ready", () => {
    console.log("Discord bot running");
});

export default (token: string) => {
    client.login(token);
};

message(client);
