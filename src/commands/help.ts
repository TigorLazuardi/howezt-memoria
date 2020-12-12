import { Message } from "discord.js";
import { commands } from ".";
import textTable from "text-table";
import { PREFIX } from "./prefix";

export default async function helpCommand(message: Message, cmd: string) {
    const reply: string[][] = [
        ["command", "|", "description"],
        ["-------", "|", "-----------"],
    ];
    for (const key in commands) {
        const row = [`${PREFIX}${key}`, "|", commands[key].shortDesc];
        reply.push(row);
    }
    await message.channel.send(`\`\`\`${textTable(reply)}\`\`\``);
}
