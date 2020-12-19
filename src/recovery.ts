import logger from "@infra/logger"

/**
 * Wraps uncaught exception in custom handling for the given func
 */
const withRecovery = async (f: () => void | Promise<void>) => {
    try {
        await f()
    } catch (e) {
        logger.log.emerg(e?.message || e || "Uncaught exception")
    }
}

export default withRecovery
