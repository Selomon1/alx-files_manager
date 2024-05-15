import { createClient } from 'redis';
import { promisify } from 'util';


class RedisClient {
    constructor() {
        this.client = createClient();
        this.isConnected = true;
        this.client.on('error', (error) => {
            console.error(error);
            this.isConnected = false;
        });
    }

    isAlive () {
        if (this.isConnected) {
            return true;
        }
        return false;
    }

    async get(key) {
        try {
            const getAsync = promisify(this.client.get).bind(this.client);
            return getAsync(key);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async set(key, value, duration) {
        const setAsync = promisify(this.client.set).bind(this.client);
        try {
            this.client.setex(key, duration, value);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async del(key) {
        const delAsync = promisify(this.client.del).bind(this.client);
        try {
            this.client.del(key);
        } catch (error) {
            console.error(error);
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;