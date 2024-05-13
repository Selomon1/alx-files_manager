import redis from 'redis';
import { promisify } from 'util';


class RedisClient {
	constructor() {
		this.client = redis.createClient();
		this.client.connect();
		this.client.on('error', (error) => {
			console.log(`Redis client error: ${error.message}`);
		});
	}

	isAlive() {
		return this.client.connect;
	}

	async get(key) {
		const getAsync = promisify(this.client.get).bind(this.client);
		try {
			return await getAsync(key);
		} catch (error) {
			console.error(`Error getting value from Redis: ${error.message}`);
			return null;
		}
	}

	async set(key, value, duration) {
		const setAsync = promisify(this.client.set).bind(this.client);
		try {
			await setAsync(key, value);
			if (duration) {
				this.client.expire(key, duration);
			}
		} catch (error) {
			console.error(`Error setting value in Redis: ${error.message}`);
		}
	}

	async del(key) {
		const delAsync = promisify(this.client.del).bind(this.client);
		try {
			await delAsync(key);
		} catch (error) {
			console.error(`Error deleting value from Redis: ${error.message}`);
		}
	}
}

const redisClient = new RedisClient();
export default redisClient;
