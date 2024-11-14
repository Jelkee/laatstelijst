import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

interface CustomJwtPayload extends JwtPayload {
  givenName: string;
  familyName: string;
  email: string;
  id: string;
}

/**
 * Verifies the JWT token and returns the decoded payload if valid.
 * @param token - The JWT token to verify.
 * @returns The decoded token payload or null if verification fails.
 */
export const verifyToken = async (token: string): Promise<CustomJwtPayload | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload; // Type assertion to CustomJwtPayload
    return decoded;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      console.error('Token has expired:', err.message);
      throw new Error('Token has expired');
    } else if (err instanceof JsonWebTokenError) {
      console.error('JWT error:', err.message);
      throw new Error('Invalid JWT token');
    } else {
      console.error('Token verification failed:', err);
      throw new Error('Failed to verify token');
    }
  }
};
