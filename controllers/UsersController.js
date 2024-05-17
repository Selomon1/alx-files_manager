import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { createHash } from 'crypto';
import { ObjectID } from 'mongodb';


class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const exisingUser = dbClient.db.collection('users').find({ email });
      if (await existingUser > 0) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = createHash('sha1').update(password).digest('hex');
      const newUser = { email, password: hashedPassword };
      const result = await dbClient.db.collection('users').insertOne(newUser);

      return res.status(201).json({ id: result.insertedId, email: newUser.email });
    } catch (error) {
      console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const objectId = new mongo.ObjectID(userId)
    const user = await dbClient.db.collection('users').findOne({ _id: objectId });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({ userId, email: user.email });
  }
}

export default UsersController;
