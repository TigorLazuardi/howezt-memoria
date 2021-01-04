import { getRandom } from "@repo/mongodb"
import { Channel, Message } from "discord.js"
import yargsParser from "yargs-parser"
import { PREFIX } from "./prefix"
import {
    checkWhitelisTypes,
    genEmbed,
    genResultQueryEmbed,
    getChannelTarget,
    sendWithLog,
    split,
    userLog,
} from "./util"

const DESCRIPTION = `${PREFIX}random sets the bot to do random search for images on the database, and will return maximum 5 images. Duplicate images may be returned.
Add \`--channel [channel name] \` argument to set the bot output to other channel that the bot can write to.

__Example Usage__:
    
**Get Random images**:
\`\`\`
${PREFIX}random
\`\`\`
Will do random search on the database and return maximum 5 images.
    
**Get Random Images and Send Them to Other Channel**. Please make sure to reference the channel and not merely a plain text:
\`\`\`
${PREFIX}random --channel #general-chat
\`\`\``

export async function randomCommand(message: Message, cmd: string): Promise<void> {
    const [_, ...rest] = split(message)
    const args = yargsParser(rest)

    if (args.help || args.h) {
        await message.channel.send(DESCRIPTION)
        userLog(message, "asked for random command help", cmd, "info", { args })
        return
    }

    const ok = checkWhitelisTypes(args, ["string", "number"])

    if (!ok) {
        await message.channel.send(
            `Bad argument(s) on parsing. Only text or number should be value of argument. Please use \`${PREFIX}random --help\` without any arguments for more info`
        )
        userLog(message, "bad arguments: keys have unsupported types", cmd, "error", args)
        return
    }

    const channel = args.channel?.toString() as string | undefined

    let channelTarget: Channel | undefined

    if (channel) {
        try {
            channelTarget = getChannelTarget(channel)
        } catch (e) {
            await sendWithLog(
                message,
                "cannot parse channel. make sure to reference the channel and not merely a plain text",
                cmd,
                "error",
                { args }
            )
            return
        }
    }

    try {
        const promises: Promise<any>[] = []
        const result = await getRandom()
        result.data.forEach((doc) => {
            const embed = genEmbed(doc)
            if (channelTarget) {
                // @ts-ignore
                promises.push(channelTarget.send(embed))
            } else {
                promises.push(message.channel.send(embed))
            }
        })
        await Promise.all(promises)
        const queryEmbed = genResultQueryEmbed(
            {
                total: result.total,
                description: "Search Random Result",
            },
            channelTarget
        )
        if (channelTarget) {
            // @ts-ignore
            await channelTarget.send(queryEmbed)
        } else {
            await message.channel.send(queryEmbed)
        }
        userLog(message, "success sending random images", cmd, "info", {
            args,
            total_documents: result.total,
        })
    } catch (e) {
        await sendWithLog(
            message,
            `something wrong happened when searching images. reason: ${e?.message || e || "unknown"}`,
            cmd,
            "emerg",
            {
                args,
                channel: channelTarget,
                error: e?.message || e,
            }
        )
    }
}
