import RoomMap, { writeRoomMap } from "@src/room"
import { Message } from "discord.js"
import yargsParser from "yargs-parser"
import { sendWithLog, split, userLog } from "./util"

const MOVE_COMAND_DESCRIPTION = `!hm_move restrict the bot to the channel where this command runs.
The bot will not respond to any other chat room in the same server if set, even if it have read write permission to the channel.`

const EXIT_COMMAND_DESCRIPTION = `!hm_exit_channel unrestrict the bot and let it acknowledge commands from other channels that it has read/write permission to`

export default async function moveCommand(message: Message, cmd: string) {
    const [_, ...rest] = split(message)
    const args = yargsParser(rest)

    if (args.help || args.h) {
        await message.channel.send(MOVE_COMAND_DESCRIPTION)
        userLog(message, "asked for move command help", cmd, "info", { args })
        return
    }
    const gID = message.guild!.id

    RoomMap.set(gID, { in_room: true, channel_id: message.channel.id })

    await writeRoomMap()
    await message.channel.send(`Acknowledged. Bot will now only respond on <#${message.channel.id}>`)
    userLog(
        message,
        `Bot in server ${message.guild?.name} (${message.guild?.id}) has moved to channel ${message.channel.id}`,
        cmd
    )
}

export async function exitChannelCommand(message: Message, cmd: string) {
    const [_, ...rest] = split(message)
    const args = yargsParser(rest)
    if (args.help || args.h) {
        await message.channel.send(EXIT_COMMAND_DESCRIPTION)
        userLog(message, "asked for exit channel command help", cmd, "info", { args })
        return
    }
    const gID = message.guild!.id
    const r = RoomMap.get(gID)
    if (r && r.in_room) {
        RoomMap.set(gID, { ...r, in_room: false })
        await writeRoomMap()
        await message.channel.send(`Acknowledged. Bot will now response to any room where bots have read access`)
        userLog(
            message,
            `Bot in server ${message.guild?.name} (${message.guild?.id}) has exited from channel ${message.channel.id}`,
            cmd
        )
    } else {
        await sendWithLog(message, `Bot is not in any room right now`, cmd)
    }
}
