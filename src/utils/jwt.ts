import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export function signUserJwt(user: { id: string; name: string; email: string }) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyJWT(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string; name: string; email: string };
}