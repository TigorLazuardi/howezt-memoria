import { Message } from "discord.js"
import { checkIfMapStringStringOrNumber, split } from "./util"
import yargsParser from "yargs-parser"

export const HOWEZT = "howezt"

export default async function uploadCommand(message: Message, cmd: string) {
    const [_, ...rest] = split(message)

    // When the user just call !hm_upload without any args or attachments
    if (!rest.length && !message.attachments.size) {
        await message.channel.send(`Description in progress...`)
        return
    }

    const args = yargsParser(rest.join(" "))
    await message.channel.send(JSON.stringify(args, null, 2))
    const ok = checkIfMapStringStringOrNumber(args)
    if (!ok) {
        await message.channel.send(
            "Bad argument on parsing.\nOnly text or number should be value of argument.\nPlease use `!hm_upload` without any arguments for more info"
        )
        return
    }
    const [__, ...fields] = Object.keys(args)

    if (!fields.length) {
        await message.channel.send(
            `Failed to parse the argument in the message.\nPlease use \`!hm_upload\` without any arguments for more info`
        )
        return
    }

    // When the user has arguments but does not upload any files
    if (!message.attachments.size) {
        await message.channel.send(`Please upload some images`)
        return
    }

    // const requiredFields = ['name']

    await message.channel.send(`Acknowledged`)
}
