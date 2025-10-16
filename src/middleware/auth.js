const jwt = require('jsonwebtoken');

// A super secret key for signing our JWTs
const JWT_SECRET = process.env.JWT_SECRET; // Load from .env file for security

// Middleware to protect routes
const auth = (req, res, next) => {
  // 1. Get the token from the request header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing.' });
  }

  const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ message: 'Token is missing.' });
  }

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Attach the user's information to the request object
    req.user = decoded; // Now we can access req.user.id, req.user.role, etc.

    // 4. Call the next middleware or route handler
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = auth;