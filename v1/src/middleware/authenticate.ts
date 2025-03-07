import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, 'LMS_secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded; // Attach user data to request if needed
    next();
  });
};

export default authenticate;
