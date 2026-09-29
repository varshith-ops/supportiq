const rateLimitMap = new Map();

const authRateLimiter = (maxRequests = 15, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const rateData = rateLimitMap.get(ip);

    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + windowMs;
      return next();
    }

    if (rateData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many authentication attempts. Please try again in 15 minutes.",
      });
    }

    rateData.count += 1;
    next();
  };
};

module.exports = authRateLimiter;
