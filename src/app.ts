import discord from "discord.js"
import logger from "@infra/logger"
import handleMessage from "./message"

export const client = new discord.Client()

client.once("ready", () => {
    logger.log.info("discord bot running")
    client.user?.setPresence({
        status: "online",
        activity: {
            name: "Ping this bot for help",
        },
    })
})

export default (token: string) => {
    client.login(token)
}

handleMessage(client)

client.on("error", logger.log.error)

const exit = () => {
    logger.log.info("app exited")
    client.destroy()
    logger.log.info("exit status 0", () => {
        process.exit(0)
    })
}

process.on("SIGINT", exit)
process.on("SIGHUP", exit)
process.on("SIGTERM", exit)
