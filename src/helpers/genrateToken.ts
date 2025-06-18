import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string): string => {
  const payload = {
    userId,
    role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '8h'
  });
  return token;
};