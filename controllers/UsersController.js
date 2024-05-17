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
    const token = req.header('x-token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.collection('users').findOne({ _id: new ('mongodb').ObjectID(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
