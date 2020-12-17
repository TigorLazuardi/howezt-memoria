import { MongoClient, MongoClientOptions } from "mongodb"

export interface ImageCollection {
    name: string
    link: string
    filename: string
    folder?: string
    metadata?: object
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
