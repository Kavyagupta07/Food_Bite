import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { usersMemory } from '../config/memoryDb.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bite_ai_fitness_jwt_secret_key_2026');

      if (process.env.MOCK_DB === 'true') {
        const mockUser = usersMemory.find((u) => u._id === decoded.id);
        if (mockUser) {
          req.user = mockUser;
          return next();
        }
        return res.status(401).json({ message: 'Not authorized, mock user not found' });
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

