import dbClient from '../utils/db';
import Bull from 'bull';
import sha1 from 'sha1';

const userQueue = new Bull('userQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const user = await dbClient.findUser({ email });

    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const useResult = await dbClient.createUser({ email, password: sha1(password) });

    userQueue.add({ userId: useResult.insertedId });

    return res.status(201).json({ id: useResult.insertedId, email });
  }
}

export default UsersController;
