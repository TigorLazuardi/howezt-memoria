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
