const { redisClient } = require("../config/redisClient");

// generic helpers you’ll reuse later
async function setJson(key, value, ttlSeconds) {
  const json = JSON.stringify(value);
  if (ttlSeconds) {
    await redisClient.set(key, json, { EX: ttlSeconds }); // SET + EXPIRE
  } else {
    await redisClient.set(key, json);
  }
}

async function getJson(key) {
  const raw = await redisClient.get(key); // GET
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Day-1: demo helpers for INCR + EXPIRE
async function incrWithTtl(key, windowSeconds) {
  const count = await redisClient.incr(key); // INCR
  if (count === 1) {
    await redisClient.expire(key, windowSeconds); // EXPIRE
  }
  const ttl = await redisClient.ttl(key);
  return { count, ttl };
}

module.exports = {
  setJson,
  getJson,
  incrWithTtl,
};
