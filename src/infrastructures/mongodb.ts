import { MongoClient, MongoClientOptions } from "mongodb"

class Mongo {
    private _client?: MongoClient
    get client() {
        if (!this._client) {
            this.initDefault()
        }
        return this._client
    }

    initialize(uri?: string, opts?: MongoClientOptions) {
        if (!uri) {
            return this.initDefault()
        }
        this._client = new MongoClient(uri, opts)
    }

    private initDefault() {
        this._client = new MongoClient(process.env.MONGODB_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    }
}

const mongo = new Mongo()

export default mongo
