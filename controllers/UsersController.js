import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';


class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const exisingUser = await dbClient.db.collection('users').findUser({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = { email, password: hashedPassword };
    const result = await dbClient.collection('users').insertOne(newUser);

    return res.status(201).json({ id: result.insertedId, email: newUser.email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.collection('users').findOne({ -id: new ('mongodb').ObjectID(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
