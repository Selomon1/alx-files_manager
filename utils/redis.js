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
        try {
            this.client.setex(key, duration, value);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async del(key) {
        try {
            this.client.del(key);
        } catch (error) {
            console.error(error);
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;