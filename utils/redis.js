const redis = require('redis');
const { get } = require('request');
const { promisify } = require('util');

class RedisClient {
    constructor() {
        this.client = redis.createClient();
        this.client.connect();
        this.client.on('error', (error) => {
            console.error(error);
        });
    }

    isAlive () {
        if (this.client.connect) {
            return true;
        }
        return false;
    }
    
    async get(key) {
        try {
            this.getAsync = promisify(this.client.get).bind(this.client);
            const value = await this.getAsync(key);
            return value;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async set(key, value, duration) {
        try {
            this.client.set(key, value, 'EX', duration);
        } catch (error) {
            console.error(error);
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