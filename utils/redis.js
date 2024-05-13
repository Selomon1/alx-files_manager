const redis = require('redis');


class RedisClient {
	constructor() {
		this.client = redis.createClient();
		this.client.on('error', (err) => {
			console.log(`Redis client error: ${err.message}`);
		});
	}

	isAlive() {
		if (this.client.connect) {
			return true;
		}
		return false;
	}

	async get(key) {
		const gval = await this.client.get(key);
		return gval;
	}

	async set(key, value, duration) {
		await this.client.set(key, value, 'EX', duration);
	}

	async del(key) {
		await this.client.del(key);
	}
}

const redisClient = new RedisClient();
module.exports = redisClient;
