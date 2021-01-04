# Howezt Memoria

Howezt memoria is a discord bot to handle images for the group `Howezt`

This bot uses MongoDB as backend for storing and searching info and uses Minio or S3 AWS api compatible buckets for image storage.

# Required Apps

1. MongoDB
2. Minio or Minio API compatible targets

# Environment Variables

They are required to be set when running the app.

| Variable           | Description                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| BOT_TOKEN          | Discord bot token                                                                                                        |
| BOT_CHAT_PREFIX    | The command prefix used to explicitly state the use is calling for the bot. Defaults to `!hm_`                           |
| BOT_LOGO_URL       | Used to show bot's avatar for [Discord Embed](https://discordjs.guide/popular-topics/embeds.html#embed-preview) messages |
| MINIO_HOST         | Minio API compatible server host                                                                                         |
| MINIO_PORT         | Port for Minio api target                                                                                                |
| MINIO_ACCESS_KEY   | Access key for minio                                                                                                     |
| MINIO_SECRET_KEY   | Secret key for minio                                                                                                     |
| MONGODB_URI        | The Uri to connect to mongodb                                                                                            |
| MONGODB_COLLECTION | The collection target of mongodb                                                                                         |

# Available Commands

Commands are actions the bot can take. They are preceded with BOT*CHAT_PREFIX. So if BOT_CHAT_PREFIX is `!hm*`Then the command becomes`!hm_current_log`

| command      | description                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| current_log  | Get latest logs                                                                                                                     |
| exit_channel | Tell bot to 'exit' channel, and acknowledge command inputs from all channels where the bot can read                                 |
| help         | Show available commands and explain what they do                                                                                    |
| logs         | Get list of logs. give log filename to fetch the content                                                                            |
| move         | **[Global command]** Restrict this bot to the channel this command runs. Requires bot to have read-write access role the channel    |
| random       | Get random images from stored database                                                                                              |
| search       | Search images according to tags or queries                                                                                          |
| upload       | Upload image to a private server. Does not support multi-image, only first image file will be processed.                            |
| folder       | List images in a folder. If no query is given, root folder will be searched. Type `{PREFIX}folder --help` to show how to use query. |

# Development

```sh
npm install
npm run dev # or npm run dev_windows on windows
```

# Production

```sh
npm install --production
npm run build
node dist/index.js
```
