const admin = (req, res, next) => {
  // The 'auth' middleware has already attached the user object to req.user
  if (req.user && req.user.role === 'admin') {
    // User is an admin, so allow them to proceed
    next();
  } else {
    // User is not an admin, send a 403 Forbidden error
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

module.exports = admin;