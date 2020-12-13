import { Message } from "discord.js";
import RoomMap, { writeRoomMap } from "@src/room";

export default async function moveCommand(message: Message, cmd: string) {
    const gID = message.guild!.id;

    RoomMap.set(gID, { in_room: true, channel_id: message.channel.id });

    await writeRoomMap();
    await message.channel.send(`acknowledged, bot will now only response on <#${message.channel.id}>`);
}
