import logger from "@infra/logger"
import { Message } from "discord.js"
import helpCommand from "./help"
import { currentLogCommand, commandLogs as logsCommand } from "./logs"
import moveCommand, { exitChannelCommand } from "./move"
import uploadCommand from "./upload"
import { hasCommand, notImplementedYet, split, withLog, withRoomRestriction } from "./util"

interface CommandCenter {
    [key: string]: {
        action: (message: Message, command: string) => Promise<void>
        shortDesc: string
    }
}

export const commands: CommandCenter = {
    help: {
        action: withRoomRestriction(withLog(helpCommand, "asked for help command")),
        shortDesc: "Show available commands and explain what they do",
    },
    upload: {
        action: withRoomRestriction(withLog(uploadCommand, "uses !hm_upload command")),
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
        action: withLog(moveCommand, "told the bot to move"),
        shortDesc:
            "[Global command] Restrict this bot to the channel this command runs. Requires bot to have read-write access role the channel",
    },
    exit_channel: {
        action: withRoomRestriction(withLog(exitChannelCommand, "told the bot to exit room")),
        shortDesc:
            "Tell bot to 'exit' channel, and acknowledge command inputs from all channels where the bot can read",
    },
    logs: {
        action: withRoomRestriction(logsCommand),
        shortDesc: "Get list of logs. give log filename to fetch the content",
    },
    current_log: {
        action: withRoomRestriction(withLog(currentLogCommand, "asked for current log")),
        shortDesc: "Get latest logs",
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
    await message.channel.send("Unknown command. type `!hm_help` for more info")
    const [cmd] = split(message)
    logger.log.info(
        `${message.author.username}/${message.member?.nickname} (${message.author.id}) calls for unsupported command: ${cmd}`
    )
}
