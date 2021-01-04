import { Message, MessageAttachment } from "discord.js"
import FsExtra from "fs-extra"
import readline from "readline"
import { Readable } from "stream"
import yargsParser from "yargs-parser"
import { PREFIX } from "./prefix"
import { sendWithLog, split, userLog } from "./util"

const CURRENT_LOG_DESCRIPTION = `Gets the content of current log and upload the file to the channel.
There's no arguments to this command.`

const COMMAND_LOG_DESCRIPTION = `Gets list of logs if not given any arguments. Use \`${PREFIX}logs filename.log\` to fetch the log`

export async function commandLogs(message: Message, cmd: string) {
    const [_, ...rest] = split(message)
    const args = yargsParser(rest)
    if (args.help) {
        await message.channel.send(COMMAND_LOG_DESCRIPTION)
        userLog(message, "ask command log help", cmd, "info", { args })
        return
    }
    if (args._.length) {
        const file = args._[0]
        try {
            const log = await readLog(file)
            const att = new MessageAttachment(getLog(file), file)
            await message.channel.send(`\`\`\`log\n${log}\`\`\``, att)
            userLog(message, `sending log file ${file}`, cmd, "info", { args })
        } catch (e) {
            await sendWithLog(message, e?.message || e || `error when trying to read file \`${file}\``, cmd, "error", {
                args,
            })
        }
        return
    }
    const dir = await FsExtra.readdir("logs")
    const logs = dir.filter((file) => file.endsWith(".log")).reverse()
    // remove current.log from the list
    logs.shift()
    const l = logs.map((logName, i) => `${i + 1}. ${logName}`)
    await message.channel.send(`Current available logs:
\`\`\`\n${l.join("\n")}\`\`\`
Use \`${PREFIX}logs filename.log\` to fetch the contents of the log`)
    userLog(message, `asked for list of logs`, cmd)
}

export async function currentLogCommand(message: Message, cmd: string) {
    const filename = "current.log"
    const [_, ...rest] = split(message)
    const args = yargsParser(rest)
    if (args.help) {
        await message.channel.send(CURRENT_LOG_DESCRIPTION)
        userLog(message, "asked for current log command help", cmd, "info", { args })
        return
    }
    try {
        const log = await readLog(filename)
        const att = new MessageAttachment(getLog(filename))
        await message.channel.send(`\`\`\`log\n${log}\`\`\``, att)
        userLog(message, "asked for current log", cmd, "info")
    } catch (e) {
        await sendWithLog(message, e?.message || e || `error when trying to read file \`current.log\``, cmd)
    }
}

/**
 * 2000 character is discord limit.
 *
 * readLog streams data from filename and reads them line by line from top to bottom
 * and inserts them to memory in FIFO sequence.
 *
 * readLog will automatically truncate if it exceeds 1990 character count (For backtick count)
 */
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
            while (charCount >= 1990) {
                const last = lines.pop()!
                charCount -= last.length
            }
        })
        rl.once("close", () => {
            resolve(lines.join("\n"))
        })
    })
}

function getLog(filename: string): Readable {
    if (!FsExtra.existsSync(`logs/${filename}`)) throw new ReferenceError(`cannot found log by name ${filename}`)
    return FsExtra.createReadStream(`logs/${filename}`)
}
