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

export interface SearchQueryResult {
    data: ImageCollection[]
    meta: { total: number }
}

/**
 * @param link the link uploaded to minio
 * @param filename the name for the entry for primary searching index
 * @param metadata the metadata for the entry. Used for help searching index
 */
export async function upsertEntry({
    name,
    link,
    filename,
    folder,
    ...metadata
}: UpsertEntry): Promise<ImageCollection> {
    const result = await mongo.db.findOneAndUpdate(
        { filename },
        {
            $set: {
                link,
                name: name || filename,
                folder,
                metadata,
                updated_at: Math.floor(Date.now() / 1000).toString(),
                updated_at_human: new Date().toString().substring(0, 24),
            },
            $setOnInsert: {
                created_at: Math.floor(Date.now() / 1000).toString(),
                created_at_human: new Date().toString().substring(0, 24),
            },
        },
        {
            upsert: true,
            returnOriginal: false,
        }
    )
    return result.value!
}

export async function deleteEntryByFilename(filename: string): Promise<void> {
    await mongo.db.deleteOne({ filename })
}

export async function deleteEntryByID(_id: string | number): Promise<void> {
    await mongo.db.deleteOne({ _id: new ObjectID(_id) })
}

export async function search({ _id, query, limit = 5, page = 0, folder = "", ...rest }: SearchQuery) {
    if (_id) {
        const id = new ObjectID(_id)
        const res = await mongo.db.findOne({ _id: id })
        if (!res) throw new MongoError(`cannot found document with _id ${_id}`)
        const result: SearchQueryResult = {
            data: [res],
            meta: { total: 1 },
        }
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

    pipeline.push({ $sort: { folder: 1, name: 1, filename: 1 } })

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

    pipeline.push(
        {
            $facet: {
                data: [{ $skip: parseInt(page.toString()) * limit }, { $limit: limit }],
                meta: [{ $count: "total" }],
            },
        },
        {
            $unwind: "$meta",
        }
    )

    const m = await mongo.db.aggregate<SearchQueryResult>(pipeline)
    let result: SearchQueryResult = {
        data: [],
        meta: { total: 0 },
    }
    await m.forEach((x) => {
        result = x
    })
    return result
}

export async function getRandom(limit = 5) {
    const count = await mongo.db.estimatedDocumentCount()
    const result = {
        data: [] as ImageCollection[],
        total: count,
    }
    const x = mongo.db.aggregate([
        {
            $sample: { size: limit },
        },
    ])

    await x.forEach((doc) => result.data.push(doc))
    return result
}

export async function rollback(...docs: ImageCollection[]) {
    const targets = docs.map((x) => new ObjectID(x._id))
    await mongo.db.deleteMany({ _id: { $in: targets } })
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
