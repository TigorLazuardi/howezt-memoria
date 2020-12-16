import { MongoClient, MongoClientOptions } from "mongodb"
import logger from "./logger"

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
        if (!this._client) {
            this._client = this.initDefault()
        }
        return this._client
    }

    initialize(uri?: string, opts?: MongoClientOptions) {
        if (!uri) {
            this.initDefault()
            return
        }
        this._client = new MongoClient(uri, opts)
    }

    private initDefault() {
        this._client = new MongoClient(process.env.MONGODB_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        return this._client
    }

    get db() {
        if (!this._client) {
            this._client = this.initDefault()
        }
        return this._client.db("howezt").collection<ImageCollection>("files")
    }
}

const mongo = new Mongo()

export default mongo
