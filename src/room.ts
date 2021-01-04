import fsExtra from "fs-extra"
import path from "path"

const CONFIG_PATH = path.resolve(__dirname, "../config/rooms.json")

export interface RoomConfig {
    [key: string]: DiscordChannel
}

export interface DiscordChannel {
    in_room: boolean
    channel_id: string
}

type ServerID = string

const RoomMap = new Map<ServerID, DiscordChannel>()

if (fsExtra.existsSync(CONFIG_PATH)) {
    const buf = fsExtra.readFileSync(CONFIG_PATH)
    const data: RoomConfig = JSON.parse(buf.toString())
    for (const key in data) {
        RoomMap.set(key, data[key])
    }
} else {
    fsExtra.outputJSONSync(CONFIG_PATH, {})
}

export async function writeRoomMap() {
    const data: RoomConfig = {}
    for (const [key, value] of RoomMap) {
        data[key] = value
    }
    return fsExtra.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2))
}

export default RoomMap
