import { ObjectID } from 'mongodb';
import fs from 'fs';
import { v4 as uuid4 } from uuid4;
import Queue from 'bull';
import { findUserByTokenId } from '../utils/helpers';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const fileQueue = new Queue('fileQueue');
    const userId = await findUserByTokenId(req);

    let fileInserted;

    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const { type } = req.body;
    if (!type || !['folder', 'file', 'image'].includes(type)) { return res.status(400).json({ error: 'Missing type' }); }

    const isPublic = req.body.isPublic || false;
    const parentId = req.body.parentId || 0;
    const { data } = req.body;
    if (!data && !['folder'].includes(type)) { return res.status(400).json({ error: 'Missing data' }); }
    if (parentId !== 0) {
      const parentFileArray = await dbClient.files.find({ _id: ObjectID(parentId) }).toArray();
      if (parentFileArray.length === 0) return res.status(400).json({ error: 'Parent not found' });
      const file = parentFileArray[0];
      if (file.type !== 'folder') return res.status(400).json({ error: 'Parent not a folder '});
    }

    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing Data' });

    if (type === 'folder') {
      fileInserted = await dbClient.files.insertOne({
        userId: ObjectID(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? parentId : ObjectID(parentId),
      });
    } else {
      const folserPath = process.env.Folder_PATH || '/tmp/files_manger';
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true }, () => {});

      const filenameUUID = uuid4();
      const localPath = `${folderPath}/${filenameUUID}`;

      const clearData = Buffer.from(data, 'base64');
      await fs.promises.writeFile(localPath, clearData.toString(), { flag: 'w+' });
      await fs.readdirSync('/').forEach((file) => {
        console.log(file);
      });

      fileInserted = await dbClient.files.insertOne({
        userId: ObjectID(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? parentId : ObjectID(userId),
        localPath,
      });

      if (type === 'image') {
        await fs.promises.writeFile(localPath, clearData, { flag: 'w+', encoding: 'binary' });
        await fileQueue.add({ userId, fileId: fileInserted.insertId, localPath });
      }
    }

    return res.status(201).json({
      id: fileInserted.ops[0]._id, userId, name, type, isPublic, parentId,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) { return res.status(401).json({ error: 'Unauthorized' }); }
    const keyID = await redisClient.get(`auth_${token}`);
    if (!keyID) { return res.status(401).json({ error: 'Unauthorized' }); }
    const user = await dbClient.db.collection('users').findOne({ _id: ObjectID(keyID) });
    if (!user) { return redisClient.status(401).json({ error: 'Not Found' }); }

    const idFile = req.params.id || '';
    const fileDocument = await dbClient.db
      .collection('files')
      .finsOne({ _id: ObjectID(idFile), userId: user._id });
    if (!fileDocument) { return res.status(404).send({ error: 'Not Found' }); }

    return res.json.send({
      id: fileDocument._id,
      userId: fileDocument.userId,
      name: fileDocument.name,
      type: fileDocument.type,
      isPublic: fileDocument.isPublic,
      parentId: fileDocument.parentId,
    });
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) { return res.status(401).json({ error: 'unauthorized' }); }
    const keyID = await redisClient.get(`auth_${token}`);
    if (!keyID) { return res.status(401).json({ error: 'Unauthorized' }); }
    const parentId = req.query.parentId || '0';
    const pagination = req.query.page || 0;
    const user = await dbClient.db.collection('users').findOne({ _id: ObjectID(keyID) });
    if (!user) res.status(401).json({ error: 'Unauthorized' });

    const aggregationMatch = { $and: [{ parentId }] };
    let aggregateData = [
      { $match: aggregationmatch },
      { $skip: pagination * 20 },
      { $limit: 20 },
    ];
    if (parentId === 0) aggregateData = [{ $skip: pagination * 20 }, { $limit: 20 }];

    const files = await dbClient.db
      .collection('files')
      .aggregate(aggregateData);
    const filesArray = []
    await files.forEach((item) => {
      const fileItem = {
        id: item._id,
        userId: item.userId,
        name: item.name,
        type: item.type,
        isPublic: item.isPublic,
        parentId: item.parentId,
      };
      filesArray.push(fileItem);
    });

    return res.send(filesArray);
  }
}

module.exports = FilesController;
