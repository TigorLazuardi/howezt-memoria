import { upload } from "@repo/minio"
import { UpsertEntry, upsertEntry } from "@repo/mongodb"
import Case from "case"
import { Message, MessageEmbed } from "discord.js"
import yargsParser from "yargs-parser"
import { checkIfMapStringStringOrNumber, fetchImage, split, urlifyText, userLog } from "./util"

export interface FieldTags {
    name?: string
    folder?: string
    [key: string]: any
}

const description = `!hm_upload uploads an image to private server.

Bot supoprts arguments to handle the upload way. Any non argument values will be parsed as the name of the photo.

Arguments comes in key-value pair. \`Keys\` start with double dashes "--". The bot supports following syntaxes:

1. \`!hm_upload name of the photo\`
1. \`!hm_upload name of the photo --key=value\`
2. \`!hm_upload name of the photo --key value\`
3. \`!hm_upload name of the photo --key="value with spaces"\`
4. \`!hm_upload name of the photo --key "value with spaces"\`
5. \`!hm_upload name of the photo --key1 "value" --key2="value"\`

Bot only supports text or number values, other values received like booleans or arrays and bot will return an error message.

Optional Unique keys that are treated differently are as follows:

1. \`--folder\` puts the image in a folder in the server.

Rest of the tags will treated as extra fields that can be used for searching.

> WARNING! Failing to follow the syntax rule (and thus fail to upload) will make the user require to reattach images
> WARNING! Bot only support png and jpeg
> WARNING! This command does the operation in upsert manner. If there is an image in the server having the same filename, it will be replaced!

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

    // When the user has arguments but does not upload any files
    if (!message.attachments.size) {
        await message.channel.send(`Please upload an image`)
        userLog(message, cmd, "no images set")
        return
    }

    const name: string = args.name?.toString() || args._.join(" ")

    const isAllImages = message.attachments.every(
        (att) =>
            !!att.name?.toLowerCase().endsWith(".png") ||
            !!att.name?.toLowerCase().endsWith(".jpg") ||
            !!att.name?.toLowerCase().endsWith(".jpeg")
    )

    const file = message.attachments.first()!
    let filename = file.name!
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

    // Required for loop to ditch '_' key by yargs
    const fieldTags: UpsertEntry = {}
    for (const key in args) {
        if (key === "_" || key === "$0") continue
        fieldTags[key] = args[key]
    }

    await message.channel.send(`Uploading photo... please wait...`)
    try {
        let folder = args.folder as string
        if (typeof folder === "string" || typeof folder === "number") {
            folder = urlifyText(folder)
            let f: string = folder
            if (f.endsWith("/")) f = f.substring(0, folder.length - 1)
            if (f.startsWith("/")) f = f.substring(1)
            folder = f
            filename = [f, filename].join("/")
        } else {
            folder = ""
        }
        const img = await fetchImage(file.url)
        const link = await upload(filename, img)
        const doc = await upsertEntry({ name, folder, link, filename, ...fieldTags })
        const embed = new MessageEmbed()
            .setColor("#0099FF")
            .setTitle("Success Upload")
            .setDescription(Case.title(doc.name))
            .setURL(doc.link)
            .setThumbnail(doc.link)
            .addFields(
                { name: "ID", value: doc._id },
                { name: "Name", value: doc.name },
                { name: "Folder", value: doc.folder || "[root]" },
                { name: "Filename", value: doc.filename },
                { name: "Created At", value: doc.created_at_human || "null" },
                { name: "Updated At", value: doc.updated_at_human || "null" }
            )

        const b = Object.keys(doc.metadata)
        b.forEach((key) => {
            embed.addField(Case.title(key), doc.metadata[key] || "null")
        })
        embed.setImage(doc.link).setTimestamp().setFooter("Howezt Memoria", doc.link)
        await message.channel.send(embed)
        userLog(message, `success upload`, cmd, "info", { doc })
    } catch (e: unknown) {
        const err = e as Error
        await message.channel.send(
            `fail to upload image, reason: \`\`\`\n${err?.message || err || "unknown failure"}\`\`\``
        )
        userLog(message, `fail to upload image`, cmd, "error", {
            reason: err?.message || err,
            error: err,
            trace: err.stack || "no stack trace",
        })
    }
}
