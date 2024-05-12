import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
	constructor() {
		this.client = createClient();
		this.clientConnected = true;

		this.client.on('error', (err) => {
			console.error('Redis client error:', err);
			this.clientConnected = false;
		});

		this.client.on('connect', () => {
			this.clientConnected = true;
		});

		this.getAsync = promisify(this.client.get).bind(this.client);
		this.setAsync = promisify(this.client.set).bind(this.client);
		this.delAsync = promisify(this.client.del).bind(this.client);
	}

	isAlive() {
		return this.clientConnected;
	}

	async get(key) {
		if (!this.isAlive()) {
			throw new Error('Redis client is not connected')
		}
		return this.getAsync(key);
	}

	async set(key, value, duration) {
		if (!this.isAlive()) {
			throw new Error('Redis client is not connected');
		}
		return this.setAsync(key, value, 'EX', duration);
	}

	async del(key) {
		if (!this.isAlive()) {
			throw new Error('Redis client is not connected');
		}
		return this.delAsync(key);
	}
}

const redisClient = new RedisClient();
export default redisClient;
