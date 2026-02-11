require('dotenv').config();
const jwt=require('jsonwebtoken');
const User=require('./models/userModel');

const jwtAuthMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    const userDoc = await User.findById(decoded.id);
    if (!userDoc) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = userDoc;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

//function to generate JWT token
const generateToken = (userOrPayload) => {
  // Accept either a user document, an object with {id} or a bare id string
  let id = null;
  if (!userOrPayload) id = null;
  else if (typeof userOrPayload === 'string') id = userOrPayload;
  else if (userOrPayload.id) id = userOrPayload.id;
  else if (userOrPayload._id) id = String(userOrPayload._id);

  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '1h' });
};


module.exports={jwtAuthMiddleware,generateToken};