import { Message } from "discord.js"
import { arrayContainsArray, checkIfMapStringStringOrNumber, split } from "./util"
import yargsParser from "yargs-parser"

interface FieldTags {
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
        return
    }

    const args = yargsParser(rest.join(" "))
    const ok = checkIfMapStringStringOrNumber(args)
    if (!ok) {
        await message.channel.send(
            "Bad argument(s) on parsing. Only text or number should be value of argument. Please use `!hm_upload` without any arguments for more info"
        )
        return
    }
    const [__, ...fields] = Object.keys(args)

    if (!fields.length) {
        await message.channel.send(
            `Failed to parse the argument in the message. Please use \`!hm_upload\` without any arguments for more info`
        )
        return
    }

    // When the user has arguments but does not upload any files
    if (!message.attachments.size) {
        await message.channel.send(`Please upload an image`)
        return
    }

    const requiredFields = ["name"]
    if (!arrayContainsArray(fields, requiredFields)) {
        await message.channel.send(
            `\`--name\` key are required. Please use \`!hm_upload\` without any arguments for more info`
        )
        return
    }

    const isAllImages = message.attachments.every(
        (att) =>
            !!att.name?.toLowerCase().endsWith(".png") ||
            !!att.name?.toLowerCase().endsWith(".jpg") ||
            !!att.name?.toLowerCase().endsWith(".jpeg")
    )

    if (isAllImages) {
        await message.channel.send(`Please only upload images. Supported images are PNG and JPEG`)
        return
    }
    const fieldTags: FieldTags = { ...args }
    delete fieldTags._
    await message.channel.send(`Acknowledged`)
}
