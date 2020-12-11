import { Message } from "discord.js";
import { hasCommand } from "./util";

interface CommandCenter {
    [key: string]: (message: Message, command: string) => Promise<void>;
}

const commands: CommandCenter = {
    help: async (m, b) => {
        await m.channel.send("Not implemented yet");
    },
};

export default async function (message: Message) {
    const trimmed = message.content.trim();
    for (const key in commands) {
        const cmd = hasCommand(trimmed, key);
        if (!!cmd) {
            commands[key](message, cmd);
            return;
        }
    }
}
