import { search } from "@repo/mongodb"
import { Channel, Message } from "discord.js"
import yargsParser from "yargs-parser"
import { FieldTags } from "./upload"
import { blackListKeys, genEmbed, genResultQueryEmbed, getChannelTarget, sendWithLog, split, userLog } from "./util"

const DESCRIPTION = `!hm_search searches for images on database.

This command requires a query search, and optional fields to narrow your search explicitly. Only maximum of 5 images will be sent to you at one time, but you can search next set of images by giving \`--page\` key.

The command will return total number of images of your query, and total number of pages 

The syntax looks like this:

> !hm_search "query to search" [--OptionalFields] [--OptionalOptions]

__Usage example__:
    
**Simple search**:
\`\`\`
!hm_search rowi
\`\`\`
This will search for all images in the database that contains the name or filename "rowi"

**Search with Fields**:
\`\`\`
!hm_search rowi --folder cmx_20 --hobby mangap
\`\`\`
This will search in the database for the name or filename \`rowi\`, that is stored in folder \`cmx_20\` and has the tag \`hobby: mangap\`
    
**Search next set of images**:
\`\`\`
!hm_search rowi --page 2
\`\`\`
This will return next set of images

**Search and send images to other channel** (Bot need write access to the channel, make sure to ***refer the channel and not just plain channel name text***):
\`\`\`
!hm_search rowi --channel #general-chat
\`\`\`
`

export default async function searchCommand(message: Message, cmd: string) {
    const [_, ...rest] = split(message)

    if (!rest.length && !message.attachments.size) {
        await message.channel.send(DESCRIPTION)
        userLog(message, "asked search help", cmd)
        return
    }

    const args = yargsParser(rest.join(" "))

    if (args.help || args.h) {
        await message.channel.send(DESCRIPTION)
        userLog(message, "asked search help", cmd, "info", { args })
        return
    }

    if (!args._.length) {
        await message.channel.send(
            "No query search detected from your message request. Please type only `!hm_search` in the text box for query info.\nIf you are trying to get images by folder, please use `!hm_folder`"
        )
        userLog(message, "bad arguments: empty query", cmd, "error", { args })
        return
    }

    const query = args._.join(" ")
    let channelTarget: Channel | undefined
    if (args.channel) {
        try {
            channelTarget = getChannelTarget(args.channel?.toString())
        } catch (e) {
            await sendWithLog(
                message,
                `failed to parse channel name. make sure to refer the channel and not just plain text`,
                cmd,
                "error",
                { args }
            )
            return
        }
    }

    let page = Number(args.page) - 1 || 0
    if (page < 0) {
        page = 0
    }

    let limit = Number(args.limit) || 5
    if (limit > 5) {
        limit = 5
    }
    const _id: string | number | undefined = args.id || args._id

    const fieldTags: FieldTags = blackListKeys(args, ["_", "$0", "channel"])
    try {
        const result = await search({
            ...fieldTags,
            query,
            limit,
            _id,
        })
        if (result.meta.total > 0 && limit * page > result.meta.total) {
            await sendWithLog(message, "There's no more images to be found with the same query", cmd, "info", {
                fields: fieldTags,
                page,
                limit,
                query,
                _id,
            })
            return
        }
        if (!result.data.length) {
            await sendWithLog(message, "no image found with such query", cmd, "error", {
                fields: fieldTags,
                page,
                limit,
                query,
                _id,
            })
            return
        }
        const promises: Promise<any>[] = []
        result.data.forEach(async (doc) => {
            const embed = genEmbed(doc)
            if (channelTarget) {
                // It is supported by discord, but it doesn't by typescript. so we ignore the typecheck
                // @ts-ignore
                promises.push(channelTarget.send(embed))
            } else {
                promises.push(message.channel.send(embed))
            }
        })
        await Promise.all(promises)
        let baseline = page * limit
        if (baseline < 1) baseline = 1
        let next = (page + 1) * limit
        const total = result.meta.total
        const embed = genResultQueryEmbed(
            {
                total: total,
                description: `Showing results from ${page * limit + 1} to ${next > total ? total : next}`,
                page,
                limit,
            },
            channelTarget
        )
        if (channelTarget) {
            // It is supported by discord, but it doesn't by typescript. so we ignore the typecheck
            // @ts-ignore
            await channelTarget.send(embed)
        } else {
            await message.channel.send(embed)
        }
        userLog(message, "success sending images", cmd, "info", { args, total_documents: total, page, limit })
    } catch (e) {
        const err = e as Error
        await sendWithLog(
            message,
            `something failed when searching images. reason: ${e?.message || e || "unknown"}`,
            cmd,
            "error",
            {
                fields: fieldTags,
                channel: channelTarget,
                page,
                query,
                limit,
                _id,
                error: e?.message || e,
                trace: err?.stack || "no stack trace",
            }
        )
    }
}
