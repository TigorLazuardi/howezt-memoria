import logger from "@infra/logger"
import { Client, Message } from "discord.js"
import commands from "./commands"
import { PREFIX } from "./commands/prefix"
import withRecovery from "./recovery"
import RoomMap from "./room"

export default function (client: Client) {
    function hasPrefix(str: string) {
        return !!str.trim().startsWith(PREFIX)
    }

    function pingsBotExplicitly(str: string) {
        return str.trim().startsWith(`<@!${client.user?.id}>`)
    }
    client.on("message", (message) => {
        withRecovery(async () => {
            if (message.author.bot) return
            try {
                switch (true) {
                    case pingsBotExplicitly(message.content):
                        await replyPingBot(message)
                        return

                    case hasPrefix(message.content):
                        await commands(message)
                        return
                }
            } catch (e) {
                await message.channel.send(e?.message || e || "something happened with the bot")
                logger.log.emerg(e?.message || (e as string) || "something happened with the bot")
            }
        })
    })
}

async function replyPingBot(message: Message) {
    const gid = message.guild!.id
    const r = RoomMap.get(gid)
    if (r) {
        if (r.in_room) {
            if (message.channel.id === r.channel_id) {
                await message.channel.send(`Hi <@${message.member?.id}>!\nPlease type \`${PREFIX}help\` for more info.`)
            } else {
                await message.channel.send(
                    `Hi <@${message.member?.id}>! I can be called on room <#${r.channel_id}>.\nPlease type \`${PREFIX}help\` over there.`
                )
            }
            logger.log.info(
                `${message.author.username}/${message.member?.nickname} (${message.author.id}) pings the bot when the bot is in room ${r.channel_id}`
            )
            return
        }
    }
    await message.channel.send(
        `Hi <@${message.member?.id}>!\nI am not placed in any room yet. Please, type \`${PREFIX}help\` for help.`
    )
    logger.log.info(
        `${message.author.username}/${message.member?.nickname} (${message.author.id}) pings the bot when bot is not in any channel`
    )
}
