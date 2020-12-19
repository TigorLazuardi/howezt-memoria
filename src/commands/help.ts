import { Message } from "discord.js"
import textTable from "text-table"
import { commands } from "."
import { PREFIX } from "./prefix"

export default async function helpCommand(message: Message, cmd: string) {
    const reply: string[][] = [
        ["command", "|", "description"],
        ["-------", "|", "-----------"],
    ]
    for (const key in commands) {
        const row = [`${PREFIX}${key}`, "|", commands[key].shortDesc]
        reply.push(row)
        reply.push(["", "", ""])
    }
    await message.channel.send(`\`\`\`${textTable(reply)}\`\`\`
Type the command with \`--help\` argument to get detailed information about the command

**Example**:
\`\`\`
!hm_random --help
\`\`\``)
}
