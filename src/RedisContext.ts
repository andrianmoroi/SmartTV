import * as genericPool from 'generic-pool';
import * as redis from 'redis';

export class RedisContext {

    private redisOptions: redis.ClientOpts
    private pool: genericPool.Pool<redis.RedisClient>

    public constructor(host: string, port: number) {
        this.redisOptions = { host, port }

        this.pool = genericPool.createPool({
            create: () => Promise.resolve(redis.createClient(this.redisOptions)),
            destroy: client => {
                client.quit()
                return Promise.resolve(undefined)
            }
        }, {
            max: 10,
            min: 1
        })
    }

    public getObject<T>(key: string): Promise<T> {
        return this.get(key)
            .then(v => <T>JSON.parse(v || "{}"))
    }

    public setOject<T>(key: string, val: T): Promise<void> {
        return this.set(key, JSON.stringify(val))
    }

    public get(key: string): Promise<string | null> {
        let clientPool = this.pool.acquire()

        return new Promise<string | null>((resolve, reject) => {
            clientPool.then(client =>
                this.getValue(client, key)
                    .then(v => resolve(v))
                    .catch(err => reject(err))
            )
        })
    }

    public set(key: string, val: string): Promise<void> {
        let clientPool = this.pool.acquire()

        return new Promise<void>((resolve, reject) => {
            clientPool.then(client =>
                this.setValue(client, key, val)
                    .then(v => {
                        return resolve(v)
                    })
                    .catch(err => {
                        return reject(err)
                    })
            )
        })
    }

    public async removeKey(key: string): Promise<void> {
        let clientPool = await this.pool.acquire()

        clientPool.DEL(key)
    }

    private getValue(client: redis.RedisClient, key: string): Promise<string | null> {
        return new Promise<string | null>((resolve, reject) =>
            client.get(key, (err, val) => {
                this.pool.release(client)

                if (err) {
                    reject(err)
                } else {
                    resolve(val)
                }
            })
        )
    }

    private setValue(client: redis.RedisClient, key: string, val: string): Promise<void> {
        return new Promise<void>((resolve, reject) =>
            client.set(key, val, (err, val) => {
                this.pool.release(client)

                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        )
    }
}