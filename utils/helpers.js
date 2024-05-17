import redisClient from './redis';
import dbClient from './db';

async function getAuthToken(req) {
    const token = req.headers['x-token'];
    return `auth_${token}`;
}

async function findUserByTokenId(req) {
    const key = await getAuthToken(req);
    const userId = await redisClient.get(key);
    return userId || null;
}

async function findUserById(userId) {
    const userExistsArray = await dbClient.users.find(`ObjectId("${userId}")`).toArray();
    return userExistsArray[0] || null;
}

export { findUserByTokenId, findUserById };
