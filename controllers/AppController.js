import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    return res.status(200).json({ redis, db });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    return res.status(200).json({ users, files });
  }
}

export default AppController;
