import { Message } from "discord.js";
import RoomMap, { writeRoomMap } from "@src/room";

export default async function moveCommand(message: Message, cmd: string) {
    const gID = message.guild!.id;

    RoomMap.set(gID, { in_room: true, channel_id: message.channel.id });

    await writeRoomMap();
    await message.channel.send(`Acknowledged. Bot will now only response on <#${message.channel.id}>`);
}

export async function exitChannelCommand(message: Message, cmd: string) {
    const gID = message.guild!.id;
    const r = RoomMap.get(gID);
    if (r && r.in_room) {
        RoomMap.set(gID, { ...r, in_room: false });
        await writeRoomMap();
        await message.channel.send(`Acknowledged. Bot will now response to any room where bots have read access`);
    } else {
        await message.channel.send(`Bot is not in any room right now`);
    }
}
