import logger from "@infra/logger"
import { Message } from "discord.js"
import helpCommand from "./help"
import { commandLogs as logsCommand, currentLogCommand } from "./logs"
import moveCommand, { exitChannelCommand } from "./move"
import { PREFIX } from "./prefix"
import { randomCommand } from "./random"
import searchCommand from "./search"
import uploadCommand from "./upload"
import { hasCommand, notImplementedYet, split, withRoomRestriction } from "./util"

interface CommandCenter {
    [key: string]: {
        action: (message: Message, command: string) => Promise<void>
        shortDesc: string
    }
}

export const commands: CommandCenter = {
    current_log: {
        action: withRoomRestriction(currentLogCommand),
        shortDesc: "Get latest logs",
    },
    exit_channel: {
        action: withRoomRestriction(exitChannelCommand),
        shortDesc:
            "Tell bot to 'exit' channel, and acknowledge command inputs from all channels where the bot can read",
    },
    help: {
        action: withRoomRestriction(helpCommand),
        shortDesc: "Show available commands and explain what they do",
    },
    logs: {
        action: withRoomRestriction(logsCommand),
        shortDesc: "Get list of logs. give log filename to fetch the content",
    },
    move: {
        action: moveCommand,
        shortDesc:
            "[Global command] Restrict this bot to the channel this command runs. Requires bot to have read-write access role for the channel target (bot must be able to read the command in the target channel)",
    },
    random: {
        action: withRoomRestriction(randomCommand),
        shortDesc: "Get random images from stored database",
    },
    search: {
        action: withRoomRestriction(searchCommand),
        shortDesc: "Search images according to tags or queries",
    },
    upload: {
        action: withRoomRestriction(uploadCommand),
        shortDesc:
            "Upload image to a private server. Does not support multi-image, only first image file will be processed.",
    },
    folder: {
        action: withRoomRestriction(notImplementedYet),
        shortDesc: `List images in a folder. If no query is given, root folder will be searched. Type ${PREFIX}folder --help to show how to use query.`,
    },
}

export default async function handleCommand(message: Message) {
    const trimmed = message.content.trim()
    for (const key in commands) {
        const cmd = hasCommand(trimmed, key)
        if (!!cmd) {
            commands[key].action(message, cmd)
            return
        }
    }
    const s = async (message: Message, cmd: string) => {
        await message.channel.send(`Unknown command: \`${cmd}\`. type \`${PREFIX}help\` for more info`)
        logger.log.info(
            `${message.author.username}/${message.member?.nickname} (${message.author.id}) calls for unsupported command: ${cmd}`
        )
    }
    const [cmd] = split(message)
    withRoomRestriction(s)(message, cmd)
}
