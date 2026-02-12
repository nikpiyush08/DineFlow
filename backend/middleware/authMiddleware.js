const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the header (Format: "Bearer <token>")
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Extract the token string
    const token = authHeader.split(' ')[1];
    
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user info to the request object so we can use it in our routes
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};