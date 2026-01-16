const { redisClient } = require("../config/redisClient");

function rateLimiter({ keyPrefix, windowSec, maxRequests, getId }) {
  return async (req, res, next) => {
    try {
      if (!redisClient?.isOpen) {
        return next();
      }

      const id = getId(req);
      if (!id) {
        return next();
      }

      const key = `${keyPrefix}:${id}`;

      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(key, windowSec);
      }

      if (current > maxRequests) {
        const ttl = await redisClient.ttl(key);

        return res.status(429).json({
          message: "Too many attempts. Please try again later.",
          retryAfterSeconds: ttl >= 0 ? ttl : undefined,
        });
      }

      return next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      return next();
    }
  };
}

module.exports = { rateLimiter };
