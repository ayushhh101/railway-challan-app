// src/middleware/rateLimiter.js
const { redisClient } = require("../config/redisClient");

/**
 * Generic Redis-based rate limiter (fixed window).
 *
 * options:
 *  - keyPrefix: string, e.g. "rl:login"
 *  - windowSec: time window in seconds, e.g. 60
 *  - maxRequests: allowed requests in that window
 *  - getId: function (req) => unique identifier (IP, userId, etc.)
 */
function rateLimiter({ keyPrefix, windowSec, maxRequests, getId }) {
  return async (req, res, next) => {
    try {
      // If Redis is not available, don't block the app
      if (!redisClient?.isOpen) {
        return next();
      }

      const id = getId(req);
      if (!id) {
        // cannot identify caller, let it pass
        return next();
      }

      const key = `${keyPrefix}:${id}`;

      // Atomic increment
      const current = await redisClient.incr(key);

      // First hit in this window → set TTL
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
      // Fail open: don't block if limiter itself crashes
      return next();
    }
  };
}

module.exports = { rateLimiter };
