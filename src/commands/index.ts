import { Message } from "discord.js";
import helpCommand from "./help";
import { hasCommand, notImplementedYet } from "./util";

interface CommandCenter {
    [key: string]: {
        action: (message: Message, command: string) => Promise<void>;
        shortDesc: string;
    };
}

export const commands: CommandCenter = {
    help: {
        action: helpCommand,
        shortDesc: "Show available commands and explain what they do",
    },
    upload: {
        action: notImplementedYet,
        shortDesc: "Upload image to a private server",
    },
    search: {
        action: notImplementedYet,
        shortDesc: "Search images according to tags or queries",
    },
    random: {
        action: notImplementedYet,
        shortDesc: "Get random images from stored database",
    },
    move: {
        action: notImplementedYet,
        shortDesc: "[Global command] Restrict this bot to the channel this command runs.",
    },
};

export default async function (message: Message) {
    const trimmed = message.content.trim();
    for (const key in commands) {
        const cmd = hasCommand(trimmed, key);
        if (!!cmd) {
            commands[key].action(message, cmd);
            return;
        }
    }
    await message.channel.send("Uknown command. type `!hm_help` for more info");
}
