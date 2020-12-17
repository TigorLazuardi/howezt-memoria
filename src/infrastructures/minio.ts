import { Client, ClientOptions } from "minio"

class Minio {
    private _client: Client | undefined
    host = "http://localhost"
    port = "9000"

    get client() {
        if (!this._client) {
            throw new Error("Minio client is not initialized")
        }
        return this._client
    }

    initialize(opt: ClientOptions) {
        this._client = new Client(opt)
        this.host = `http://${opt.endPoint}`
        this.port = opt.port?.toString() || "9000"
    }
}

export default new Minio()
