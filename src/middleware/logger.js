const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // Pass control to the next middleware or route handler
};

module.exports = logger;