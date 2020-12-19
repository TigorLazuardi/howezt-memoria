import logger from "@infra/logger"
import { ImageCollection } from "@infra/mongodb"
import { client } from "@src/app"
import { BOT_LOGO_URL } from "@src/glossary"
import RoomMap from "@src/room"
import Case from "case"
import { Message, MessageEmbed } from "discord.js"
import { IncomingMessage } from "http"
import { get } from "https"
import yargsParser from "yargs-parser"
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
    logger.log.info(`${message.author.username}/${message.member?.nickname} (${message.author.id}) ${msg}`, {
        command: cmd,
    })
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
export function arrayContainsArray(superset: ReadonlyArray<any>, subset: ReadonlyArray<any>): boolean {
    if (!subset.length) {
        return false
    }
    return subset.every((val) => !!~superset.indexOf(val))
}

/**
 * check if object passed only has string or number of values
 */
export function checkIfMapStringStringOrNumber(obj: { readonly [key: string]: any }): boolean {
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

export function userLog(
    message: Message,
    msg: string,
    cmd: string,
    type: "info" | "error" | "warn" | "emerg" | "debug" = "info",
    data?: { [key: string]: any }
) {
    logger.log[type](`${message.author.username}/${message.member?.nickname} (${message.author.id}) ${msg}`, {
        ...data,
        command: cmd,
    })
}

export async function sendWithLog(
    message: Message,
    msg: string,
    cmd: string,
    type: "info" | "error" | "warn" | "emerg" | "debug" = "info",
    data?: { [key: string]: any }
) {
    await message.channel.send(msg)
    logger.log[type](`${message.author.username}/${message.member?.nickname} (${message.author.id}) ${msg}`, {
        command: cmd,
        data,
    })
}

/**
 * Change non url friendly chars to underscores and trim trailing or starting underscores
 */
export function urlifyText(text: string | number) {
    return text
        .toString()
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/^_+|_+$/, "")
}

export function fetchImage(url: string): Promise<IncomingMessage> {
    return new Promise((resolve) => get(url, resolve))
}

export function genEmbed(doc: ImageCollection) {
    const embed = new MessageEmbed()
        .setColor("#0099FF")
        .setTitle(Case.title(doc.name))
        .setURL(doc.link)
        .setThumbnail(BOT_LOGO_URL)
        .addFields(
            { name: "ID", value: doc._id },
            { name: "Name", value: doc.name },
            { name: "Link", value: doc.link },
            { name: "Folder", value: doc.folder || "[root]" },
            { name: "Filename", value: doc.filename },
            { name: "Created At", value: doc.created_at_human || "null" },
            { name: "Last Update", value: doc.updated_at_human || "null" }
        )
        .setImage(doc.link)
        .setTimestamp()
        .setFooter("Howezt Memoria", BOT_LOGO_URL)

    for (const key in doc.metadata) {
        embed.addField(Case.title(key), doc.metadata[key] || "null")
    }
    return embed
}

export function blackListKeys(args: yargsParser.Arguments, keys: string[]) {
    const result: { [key: string]: any } = {}
    for (const k of Object.keys(args)) {
        if (keys.includes(k)) continue
        result[k] = args[k]
    }
    return result
}

export function getChannelTarget(channel: string) {
    let str: string
    let ch = channel.match(/<#(\w+)>/)
    if (ch && typeof ch[1] === "string") {
        str = ch[1]
    } else {
        throw new Error("bad channel id")
    }
    return client.channels.cache.get(str)
}
