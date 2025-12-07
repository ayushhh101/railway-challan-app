const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url: redisUrl,
});

// basic logging
redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("🔌 Redis connecting…");
});

redisClient.on("ready", () => {
  console.log("✅ Redis ready:", redisUrl);
});

// connect once at startup
async function initRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}


module.exports = {
  redisClient,
  initRedis,
};
