import { Message } from "discord.js";
import { PREFIX } from "./prefix";

/**
 * Check if command is available for bots. Returns empty string if not available
 */
export function hasCommand(content: string, cmd: string) {
    const command = `${PREFIX}${cmd}`;
    if (content.trim().startsWith(command)) {
        return command;
    } else {
        return "";
    }
}

export async function notImplementedYet(message: Message, cmd: string) {
    await message.channel.send("not implemented yet");
}
