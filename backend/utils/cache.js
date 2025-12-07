const { redisClient } = require("../config/redisClient");

async function getCache(key) {
  if (!redisClient?.isOpen) return null;

  const raw = await redisClient.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse cache JSON for key:", key, e.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 60) {
  if (!redisClient?.isOpen) return;
  const json = JSON.stringify(value);
  await redisClient.set(key, json, { EX: ttlSeconds }); // TTL in seconds
}

async function delCacheKey(key) {
  if (!redisClient?.isOpen) return;
  await redisClient.del(key);
}

module.exports = {
  getCache,
  setCache,
  delCacheKey,
};
