import { Client } from "discord.js";
import { PREFIX } from "./commands/prefix";
import commands from "./commands";

export default function (client: Client) {
    function hasPrefix(str: string) {
        return !!str.trim().startsWith(PREFIX);
    }

    function pingsBotExplicitly(str: string) {
        return str.trim().startsWith(`<@!${client.user?.id}>`);
    }
    client.on("message", async (message) => {
        if (message.author.bot) return;
        try {
            if (pingsBotExplicitly(message.content)) {
                await message.channel.send(`Hi <@${message.member?.id}>!\nPlease, type \`!hm_help\` for help.`);
            }
            if (hasPrefix(message.content)) {
                await commands(message);
            }
        } catch (e) {
            await message.channel.send(e?.message || e || "something happened with the bot");
        }
    });
}
