import logger from "@infrastructures/logger"
import { Message } from "discord.js"
import FsExtra from "fs-extra"
import readline from "readline"
import { split } from "./util"

export async function commandLogs(message: Message, cmd: string) {
    const splits = split(message)
    if (splits.length > 1) {
        try {
            const log = await readLog(splits[1])
            await message.channel.send(`\`\`\`log\n${log}\`\`\``)
        } catch (e) {
            await message.channel.send(e?.message || e || `error when trying to read file \`${splits[1]}\``)
        }
        logger.log.info(
            `${message.author.username}/${message.member?.nickname} (${message.author.id}) asked for log with filename ${splits[1]}`
        )
        return
    }
    const dir = await FsExtra.readdir("logs")
    const logs = dir.filter((file) => file.endsWith(".log")).reverse()
    logs.shift()
    const l = logs.map((l, i) => `${i + 1}. ${l}`)
    await message.channel.send(`Current available logs:
\`\`\`\n${l.join("\n")}\`\`\`
Use \`!hm_logs filename.log\` to fetch the contents of the log`)
    logger.log.info(
        `${message.author.username}/${message.member?.nickname} (${message.author.id}) asked for list of logs`
    )
}

export async function currentLogCommand(message: Message, cmd: string) {
    try {
        const log = await readLog("current.log")
        await message.channel.send(`\`\`\`log\n${log}\`\`\``)
    } catch (e) {
        await message.channel.send(e?.message || e || `error when trying to read file \`current.log\``)
    }
}

function readLog(filename: string): Promise<string> {
    const file = `logs/${filename}`
    let charCount = 0
    return new Promise((resolve, reject) => {
        if (!FsExtra.existsSync(file)) {
            return reject(new Error(`cannot found file by name \`${filename}\``))
        }
        const lines: string[] = []
        const rl = readline.createInterface(FsExtra.createReadStream(file))
        rl.on("line", (line) => {
            lines.unshift(line)
            charCount += line.length
            // 2000 is discord limit.
            // Using backticks consumes quite a bit of char space,
            // so we limit it to 50 char less
            while (charCount >= 1950) {
                const last = lines.pop()!
                charCount -= last.length
            }
        })
        rl.once("close", () => {
            resolve(lines.join("\n"))
        })
    })
}
