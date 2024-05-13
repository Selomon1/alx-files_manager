import redis from 'redis';
import { promisify } from 'util';


class RedisClient {
	constructor() {
		this.client = redis.createClient();
		this.client.connect();
		this.client.on('error', (err) => {
			console.log(`Redis client error: ${err.message}`);
		});
		this.getAsync = promisify(this.client.get).bind(this.client);
		this.setAsync = promisify(this.client.set).bind(this.client);
		this.delAsync = promisify(this.client.del).bind(this.client);
	}

	isAlive() {
		if (this.client.connect) {
			return true;
		}
		return false;
	}

	async get(key) {
		const gval = await this.getAsync(key);
		return gval;
	}

	async set(key, value, duration) {
		await this.setAsync(key, value, 'EX', duration);
	}

	async del(key) {
		await this.delAsync(key);
	}
}

const redisClient = new RedisClient();
export default redisClient;
