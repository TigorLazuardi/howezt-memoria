import { MongoClient, MongoClientOptions, ObjectID } from "mongodb"

export interface ImageCollection {
    _id: ObjectID
    name: string
    link: string
    filename: string
    folder: string
    updated_at: string
    updated_at_human: string
    created_at: string
    created_at_human: string
    metadata: { [key: string]: any }
}

class Mongo {
    private _client?: MongoClient
    get client() {
        return this._client!
    }

    async initialize(uri?: string, opts?: MongoClientOptions) {
        if (!uri) {
            await this.initDefault()
            return
        }
        this._client = await new MongoClient(uri, opts).connect()
    }

    private async initDefault() {
        this._client = await new MongoClient(process.env.MONGODB_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).connect()
        return this._client
    }

    get db() {
        return this._client!.db("howezt").collection<ImageCollection>("files")
    }
}

const mongo = new Mongo()

export default mongo
