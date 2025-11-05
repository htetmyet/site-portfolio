import jwt from 'jsonwebtoken';

const authHeaderRegex = /^Bearer\s+(.+)$/i;

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const match = header.match(authHeaderRegex);
  if (!match) {
    return res.status(401).json({ message: 'Invalid authorization header format' });
  }

  const token = match[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
