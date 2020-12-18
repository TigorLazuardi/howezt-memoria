import { search } from "@repo/mongodb"
import { Message } from "discord.js"
import textTable from "text-table"
import yargsParser from "yargs-parser"
import { FieldTags } from "./upload"
import { sendWithLog, split, userLog } from "./util"

const DESCRIPTION = `!hm_search searches for images on database.

This command requires a query search, and optional fields to narrow your search explicitly. Only maximum of 5 images will be sent to you at one time, but you can search next set of images by giving \`--page\` key.

The command will return total number of images of your query, and total number of pages 

The syntax looks like this:

> !hm_search "query to search" [--OptionalFields] [--OptionalOptions]

Usage example:
    
Simple search:
\`\`\`
!hm_search rowi
\`\`\`
This will search in the database for the name or filename contains "rowi"

Search with Fields:
\`\`\`
!hm_search rowi --folder cmx_20 --hobby mangap
\`\`\`
This will search in the database for the name or filename \`rowi\`, that is stored in folder \`cmx_20\` and has the tag \`hobby: mangap\`
    
Search next set of images:
\`\`\`
!hm_search rowi --page 2
\`\`\`
This will return next set of images`

export default async function searchCommand(message: Message, cmd: string) {
    const [_, ...rest] = split(message)

    if (!rest.length && !message.attachments.size) {
        await message.channel.send(DESCRIPTION)
        userLog(message, "asked search help", cmd)
        return
    }

    const args = yargsParser(rest.join(" "))

    if (!args._.length) {
        await message.channel.send(
            "No query search detected from your message request. Please type only `!hm_search` in the text box for query info"
        )
        userLog(message, "bad arguments: empty query", cmd, "error", { args })
        return
    }

    const query = args._.join(" ")

    let page = Number(args.page) - 1 || 0
    if (page < 0) {
        page = 0
    }

    let limit = Number(args.limit) || 5
    if (limit > 5) {
        limit = 5
    }
    const _id: string | number | undefined = args.id || args._id

    const fieldTags: FieldTags = { ...args }
    fieldTags._ = void 0
    console.log(fieldTags)

    try {
        const result = await search({
            ...fieldTags,
            query,
            limit,
            _id,
        })
        console.log(result)
        if (!result.length) {
            await sendWithLog(message, "no image found with such query", cmd, "error", {
                fields: fieldTags,
                page,
                limit,
                query,
                _id,
            })
            return
        }
        result.forEach(async (e) => {
            const reply: string[] = []
            const metas: string[][] = []
            for (const key in e.metadata) {
                metas.push([key, ":", e.metadata[key] || ""])
            }
            const placeholder: string[][] = [
                ["```"],
                ["id", ":", e._id.toHexString()],
                ["filename", ":", e.filename],
                ["folder", ":", e.folder ? e.folder : "[root]"],
                ...metas,
                ["```"],
            ]
            reply.push(textTable(placeholder))
            reply.push(e.link)
            await message.channel.send(reply.join("\n"))
        })
    } catch (e) {
        await sendWithLog(
            message,
            `something failed when searching images. reason: ${e?.message || e || "unknown"}`,
            cmd,
            "error",
            {
                fields: fieldTags,
                page,
                query,
                limit,
                _id,
                error: e?.message || e,
            }
        )
    }
}
