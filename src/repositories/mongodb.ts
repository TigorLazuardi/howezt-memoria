import mongo from "@infra/mongodb"
import { MongoError, ObjectID } from "mongodb"
import { ImageCollection } from "@infra/mongodb"

export interface SearchQuery {
    /**
     * Will ignore the rest of the query if set
     */
    _id?: string | number

    /**
     * Causes the whole query to exit if query is not given (except when _id is given)
     */

    query?: string | number
    limit?: number
    [key: string]: string | number | undefined
}

/**
 * @param link the link uploaded to minio
 * @param filename the name for the entry for primary searching index
 * @param metadata the metadata for the entry. Used for help searching index
 */
export async function addEntry(
    link: string,
    filename: string,
    folder = "",
    metadata?: { [key: string]: any }
): Promise<void> {
    await mongo.db.insertOne({
        link,
        name: metadata?.name || filename,
        folder,
        filename,
        metadata,
    })
}

export async function deleteEntry(_id: string | number): Promise<void> {
    await mongo.db.deleteOne({ _id: new ObjectID(_id) })
}

export async function search({ _id, query, limit = 5, ...rest }: SearchQuery) {
    const result: ImageCollection[] = []
    if (_id) {
        const id = new ObjectID(_id)
        const res = await mongo.db.findOne({ _id: id })
        if (!res) throw new MongoError(`cannot found document with _id ${_id}`)
        result.push(res)
        return result
    }

    if (!query) {
        throw new Error("query must be given")
    }

    if (limit > 15) {
        limit = 15
    } else if (limit < 1) {
        limit = 1
    }

    const pipeline: object[] = [
        {
            $match: {
                $text: query,
            },
        },
    ]

    if (rest.folder) {
        pipeline.push({
            $match: {
                folder: rest.folder,
            },
        })
    }

    // don't include name and folder metadata. Already done in the first two pipeline
    delete rest.name
    delete rest.folder

    // Check for metadata
    const keys = Object.keys(rest)
    if (keys.length) {
        const target: { [key: string]: any } = {}
        keys.forEach((k) => {
            let value = rest[k]
            if (typeof value === "string") {
                const re = {
                    $regex: value,
                    $options: "i",
                }
                target[`metadata.${k}`] = re
            } else {
                target[`metadata.${k}`] = value
            }
        })
        pipeline.push({ $match: target })
    }

    pipeline.push({ $limit: limit })

    const m = await mongo.db.aggregate(pipeline)
    m.forEach((x) => result.push(x))
    return result
}

export async function index() {
    await mongo.db.createIndex([
        ["name", "text"],
        ["filename", "text"],
        ["folder", 1],
    ])
}
