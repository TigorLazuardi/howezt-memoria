import mongo, { ImageCollection } from "@infra/mongodb"
import { MongoError, ObjectID } from "mongodb"

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

export interface UpsertEntry {
    name?: string
    link?: string
    filename?: string
    folder?: string
    [key: string]: string | number | undefined
}

/**
 * @param link the link uploaded to minio
 * @param filename the name for the entry for primary searching index
 * @param metadata the metadata for the entry. Used for help searching index
 */
export async function upsertEntry({ name, link, filename, folder, ...metadata }: UpsertEntry): Promise<string> {
    const result = await mongo.db.updateOne(
        { filename },
        {
            $set: {
                link,
                name: name || filename,
                folder,
                metadata,
            },
        },
        {
            upsert: true,
        }
    )
    return result.upsertedId._id.toHexString()
}

export async function deleteEntryByFilename(filename: string): Promise<void> {
    await mongo.db.deleteOne({ filename })
}

export async function deleteEntryByID(_id: string | number): Promise<void> {
    await mongo.db.deleteOne({ _id: new ObjectID(_id) })
}

export async function search({ _id, query, limit = 5, page = 0, folder = "", ...rest }: SearchQuery) {
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
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { folder: { $regex: query, $options: "i" } },
                    { filename: { $regex: query, $options: "i" } },
                ],
            },
        },
    ]

    if (folder) pipeline.push({ $match: { folder } })

    pipeline.push({ $sort: { name: 1, folder: 1, filename: 1 } })

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

    pipeline.push({ $skip: parseInt(page.toString()) * limit })
    pipeline.push({ $limit: limit })

    const m = await mongo.db.aggregate(pipeline)
    await m.forEach((x) => {
        console.log(x)
        result.push(x)
    })
    return result
}

export async function index() {
    await mongo.db.createIndex({ name: 1 }, { name: "name index" })
    await mongo.db.createIndex(
        {
            filename: 1,
        },
        { name: "unique filename", unique: true }
    )
    await mongo.db.createIndex(
        {
            folder: 1,
        },
        { name: "folder index" }
    )
}
