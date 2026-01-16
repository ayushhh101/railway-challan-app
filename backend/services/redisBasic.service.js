const { redisClient } = require("../config/redisClient");

async function setJson(key, value, ttlSeconds) {
  const json = JSON.stringify(value);
  if (ttlSeconds) {
    await redisClient.set(key, json, { EX: ttlSeconds }); 
  } else {
    await redisClient.set(key, json);
  }
}

async function getJson(key) {
  const raw = await redisClient.get(key); 
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function incrWithTtl(key, windowSeconds) {
  const count = await redisClient.incr(key); 
  if (count === 1) {
    await redisClient.expire(key, windowSeconds); 
  }
  const ttl = await redisClient.ttl(key);
  return { count, ttl };
}

module.exports = {
  setJson,
  getJson,
  incrWithTtl,
};
