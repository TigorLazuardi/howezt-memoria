import { Client, ClientOptions } from "minio"

class Minio {
    private _client: Client | undefined

    get client() {
        if (!this._client) {
            throw new Error("Minio client is not initialized")
        }
        return this._client
    }

    initialize(opt: ClientOptions) {
        this._client = new Client(opt)
    }
}

export default new Minio()
