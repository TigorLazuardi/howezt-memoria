import { upload } from "@repo/minio"
import { UpsertEntry, upsertEntry } from "@repo/mongodb"
import { Message } from "discord.js"
import { Readable } from "stream"
import textTable from "text-table"
import yargsParser from "yargs-parser"
import { arrayContainsArray, checkIfMapStringStringOrNumber, split, urlifyText, userLog } from "./util"

export interface FieldTags {
    name?: string
    folder?: string
    [key: string]: any
}

const description = `!hm_upload uploads an image to private server.

upload requires arguments to be passed (written in the text box).
Arguments comes in key-value pair. \`Keys\` start with double dashes "--". The bot supports following syntaxes:

1. \`--key=value\`
2. \`--key value\`
3. \`--key="value with spaces"\`
4. \`--key "value with spaces"\`
5. \`--key1 "value" --key2="value"\`

Bot only supports text or number values, other values received and bot will return an error message.

Bot requires \`--name\` key for easy searching when called with \`!hm_search\`.

Optional Unique keys are as follows:

1. \`--folder\` puts the image in a folder in the server.

Rest of the tags will treated as extra fields that can be used for searching.

> WARNING! Failing to follow the syntax rule (and thus fail to upload) will make the user require to reattach images
> WARNING! Bot only support png and jpeg
    
Check image example below for example:

http://206.189.149.81:9000/howezt/_examples/Discord_HtjvYlfl4l.png
`

export default async function uploadCommand(message: Message, cmd: string) {
    const [_, ...rest] = split(message)

    // When the user just call !hm_upload without any args or attachments
    if (!rest.length && !message.attachments.size) {
        await message.channel.send(description)
        userLog(message, "asked upload help", cmd)
        return
    }

    const args = yargsParser(rest.join(" "))
    const ok = checkIfMapStringStringOrNumber(args)
    if (!ok) {
        await message.channel.send(
            "Bad argument(s) on parsing. Only text or number should be value of argument. Please use `!hm_upload` without any arguments for more info"
        )
        userLog(message, "bad arguments: keys have unsupported types", cmd, "error", args)
        return
    }
    const [__, ...fields] = Object.keys(args)

    if (!fields.length) {
        await message.channel.send(
            `Failed to parse the argument in the message. Please use \`!hm_upload\` without any arguments for more info`
        )
        userLog(message, "bad arguments: no keys at all", cmd, "error", args)
        return
    }

    // When the user has arguments but does not upload any files
    if (!message.attachments.size) {
        await message.channel.send(`Please upload an image`)
        userLog(message, cmd, "no images set")
        return
    }

    const requiredFields = ["name"]
    if (!arrayContainsArray(fields, requiredFields)) {
        await message.channel.send(
            `\`--name\` key is required. Please use \`!hm_upload\` without any arguments for more info`
        )
        userLog(message, "user does not set --name key", "error")
        return
    }

    const name = args.name as string

    const isAllImages = message.attachments.every(
        (att) =>
            !!att.name?.toLowerCase().endsWith(".png") ||
            !!att.name?.toLowerCase().endsWith(".jpg") ||
            !!att.name?.toLowerCase().endsWith(".jpeg")
    )

    const file = message.attachments.first()
    let filename = file!.name!
    const [exName, ext] = [filename.split(".").shift()!, filename.split(".").pop()!]

    if (typeof args.filename === "string" || typeof args.filename === "number") {
        filename = [urlifyText(args.filename), ext].join(".")
        delete args.filename
    }

    if (!isAllImages) {
        await message.channel.send(`Please only an image. Supported image is PNG and JPEG`)
        userLog(message, "fails to upload because file is not png or jpeg", cmd, "error", { filename })
        return
    }

    if (exName === "unknown") {
        filename = args.name as string
        filename = [urlifyText(filename), ext].join(".")
    }

    const fieldTags: UpsertEntry = { ...args }
    fieldTags._ = undefined
    try {
        let folder = args.folder
        if (typeof folder === "string") {
            folder = urlifyText(folder)
            let f: string = folder
            if (f.endsWith("/")) f = f.substring(0, folder.length - 1)
            if (f.startsWith("/")) f = f.substring(1)
            folder = f
            filename = [f, filename].join("/")
        }
        const link = await upload(filename, file!.attachment as Readable)
        await upsertEntry({ name, folder, link, filename, ...fieldTags })
        const t: any[][] = [
            ["filename", ":", filename],
            ["link", ":", link],
        ]
        for (const key in fieldTags) {
            if (key === "name" || key === "folder") continue
            t.push([key, ":", fieldTags[key]])
        }

        const replyMeta = textTable(t)
        await message.channel.send(`success upload.\`\`\`\n${replyMeta}\`\`\``)
        userLog(message, `success upload`, cmd, "info", { filename, link })
    } catch (e) {
        await message.channel.send(
            `fail to upload image, reason: \`\`\`\n${e?.message || e || "unknown failure"}\`\`\``
        )
        userLog(message, `fail to upload image`, cmd, "error", {
            reason: e?.message || e,
            error: e,
        })
    }
}
