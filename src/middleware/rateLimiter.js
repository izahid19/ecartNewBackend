const redis = require("../config/redis");

function createRateLimiter({ windowSeconds = 60, max = 10, keyPrefix = "rl:", getKey }) {
  if (typeof getKey !== "function") {
    throw new Error("createRateLimiter requires a getKey(req) function");
  }

  return async function rateLimiter(req, res, next) {
    try {
      const ident = getKey(req);
      if (!ident) return next();

      const redisKey = `${keyPrefix}${ident}`;
      const current = await redis.incr(redisKey);

      if (current === 1) {
        await redis.expire(redisKey, windowSeconds);
      }

      const remaining = Math.max(0, max - current);

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", Date.now() + windowSeconds * 1000);

      if (current > max) {
        return res.status(429).json({
          success: false,
          message: `Too many requests. Try again after ${windowSeconds} seconds.`,
        });
      }

      return next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      return next();
    }
  };
}

module.exports = { createRateLimiter };
