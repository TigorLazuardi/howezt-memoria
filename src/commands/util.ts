import logger from "@src/infrastructures/logger"
import RoomMap from "@src/room"
import { Message } from "discord.js"
import { PREFIX } from "./prefix"

/**
 * Check if command is available for bots. Returns empty string if not available
 */
export function hasCommand(content: string, cmd: string) {
    const command = `${PREFIX}${cmd}`
    if (content.trim().startsWith(command)) {
        return command
    } else {
        return ""
    }
}

/**
 * Placeholder for commands that are not implemented yet
 */
export async function notImplementedYet(message: Message, cmd: string) {
    await message.channel.send("not implemented yet")
}

async function doNothing(message: Message, cmd: string) {
    // Literally told the app to do nothing
}

/**
 * Middleware function to make sure if the bot is in correct room.
 * Bot does nothing when it receive commands from wrong room.
 */
export const withRoomRestriction = (cmdFunc: (m: Message, c: string) => Promise<void>) => (
    message: Message,
    cmd: string
) => {
    const gID = message.guild!.id
    if (RoomMap.has(gID)) {
        const room = RoomMap.get(gID)!
        if (room.in_room) {
            if (message.channel.id === room.channel_id) {
                return cmdFunc(message, cmd)
            } else {
                return doNothing(message, cmd)
            }
        }
    }
    return cmdFunc(message, cmd)
}

/**
 * Middleware function to add log at the end of the command function
 */
export const withLog = (cmdFunc: (m: Message, c: string) => Promise<void>, msg: string) => async (
    message: Message,
    cmd: string
) => {
    await cmdFunc(message, cmd)
    logger.log.info(`${message.author.username}/${message.member?.nickname} (${message.author.id}) ${msg}`)
}

/**
 * Trims and splits message content by empty white space
 */
export function split(message: Message) {
    return message.content.trim().split("\n").join(" ").split(/\s+/g)
}

/**
 * Returns TRUE if the first specified array contains all elements
 * from the second one. FALSE otherwise.
 */
export function arrayContainsArray(superset: any[], subset: any[]): boolean {
    if (!subset.length) {
        return false
    }
    return subset.every((val) => !!~superset.indexOf(val))
}

/**
 * check if object passed only has string or number of values
 */
export function checkIfMapStringStringOrNumber(obj: { [key: string]: any }): boolean {
    for (const key in obj) {
        if (key === "_") continue
        switch (typeof obj[key]) {
            case "number":
                continue
            case "string":
                continue
            default:
                return false
        }
    }
    return true
}
