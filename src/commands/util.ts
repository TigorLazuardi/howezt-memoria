import logger from "@src/infrastructures/logger";
import RoomMap from "@src/room";
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

async function doNothing(message: Message, cmd: string) {
    // Literally told the app to do nothing
}

export const withRoomRestriction = (cmdFunc: (m: Message, c: string) => Promise<void>) => (
    message: Message,
    cmd: string
) => {
    const gID = message.guild!.id;
    if (RoomMap.has(gID)) {
        const room = RoomMap.get(gID)!;
        if (room.in_room) {
            if (message.channel.id === room.channel_id) {
                return cmdFunc(message, cmd);
            } else {
                return doNothing(message, cmd);
            }
        }
    }
    return cmdFunc(message, cmd);
};

export const withLog = (cmdFunc: (m: Message, c: string) => Promise<void>, msg: string) => async (
    message: Message,
    cmd: string
) => {
    await cmdFunc(message, cmd);
    logger.log.info(`${message.author.username}/${message.member?.nickname} (${message.author.id}) ${msg}`);
};
