import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect((err) => {
      if (err) {
        this.db = false;
      } else {
        this.db = this.client.db(database);
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.isAlive() ? this.db.collection('users').countDocuments() : 0;
  }

  async nbFiles() {
    return this.isAlive() ? this.db.collection('files').countDocuments() : 0;
  }

  async findUser(email) {
    return this.db.collection('users').findOne({ email });
  }

  async findUserById(id) {
    return this.db.collection('users').findOne({ _id: id });
  }

  async createUser(user) {
    const result = await this.db.collection('users').insertOne(user);
    return result.ops[0];

  }
}

const dbClient = new DBClient();
module.exports = dbClient;
