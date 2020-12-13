import { Message } from "discord.js";
import helpCommand from "./help";
import moveCommand from "./move";
import { hasCommand, notImplementedYet, withRoomRestriction } from "./util";

interface CommandCenter {
    [key: string]: {
        action: (message: Message, command: string) => Promise<void>;
        shortDesc: string;
    };
}

export const commands: CommandCenter = {
    help: {
        action: withRoomRestriction(helpCommand),
        shortDesc: "Show available commands and explain what they do",
    },
    upload: {
        action: withRoomRestriction(notImplementedYet),
        shortDesc: "Upload image to a private server",
    },
    search: {
        action: withRoomRestriction(notImplementedYet),
        shortDesc: "Search images according to tags or queries",
    },
    random: {
        action: withRoomRestriction(notImplementedYet),
        shortDesc: "Get random images from stored database",
    },
    move: {
        action: moveCommand,
        shortDesc:
            "[Global command] Restrict this bot to the channel this command runs. Requires bot to have read-write access role the channel",
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
