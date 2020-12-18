import minio from "@infra/minio"
import { HOWEZT } from "@src/glossary"
import { Readable } from "stream"

/**
 * Upload file to minio or S3 compatiblae bucket. If putting on folder, prefix the folder name before the file name and join with '/'
 * @returns the link for the file
 */
export function upload(filename: string, file: Readable | Buffer | string): Promise<string> {
    return new Promise((resolve, reject) => {
        minio.client.putObject(HOWEZT, filename, file, (err) => {
            if (err) return reject(err)
            resolve(`${minio.host}:${minio.port}/${HOWEZT}/${filename}`)
        })
    })
}

export function deleteFile(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
        minio.client.removeObject(HOWEZT, filename, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

/**
 * @returns the readable file from object
 * @throws when file with filename not is found
 */
export function getFile(filename: string): Promise<Readable> {
    return new Promise((resolve, reject) => {
        minio.client.getObject(HOWEZT, filename, (e, result) => {
            if (e) return reject(e)
            resolve(result)
        })
    })
}
