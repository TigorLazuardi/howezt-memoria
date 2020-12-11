import { PREFIX } from "./prefix";

/**
 * Check if command is available for bots. Returns empty string if not available
 */
export function hasCommand(content: string, cmd: string) {
    const command = `${PREFIX}${cmd}`;
    if (content.trim().startsWith(command)) {
        return command;
    } else {
        return "";
    }
}
