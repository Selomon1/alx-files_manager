import DBClient from './utils/db';

import Bull from 'bull';
import { ObjectID, ObjectId } from 'mongodb';
import ImageThumbnail from 'image-thumbnail';
import fs from 'fs';

const fileQueu = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

const createImageThumbnail = async (path, optios) => {
    try {
        const thumbnail = await ImageThumbnail(path, options);
        const pathNail = `${path}_${options.width}`;

        await fs.writeFileSync(pathNail, thumbnail);
    } catch (error) {
        console.log(error)
    }
};

fileQueue.process(async (job) => {
    const { fileId } = job.date;
    if (!fileId) throw Error('Missing fileId');

    const fileDocument = await DBClient.db.collection('users').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!fileDocument) throw Error('File not found');

    createImageThumbnail(fileDocument.localPath, { width: 500 });
    createImageThumbnail(fileDocument.localPath, { width: 250 });
    createImageThumbnail(fileDocument.localPath, { width: 100 });
});

userQueue.process(async (job) => {
    const { userId } = job.data;
    if (!userId) throw Error('User not found');

    console.log(`Welcome ${userDocument.email}`);
});