import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Define the type for the decoded JWT payload
interface CustomJwtPayload extends JwtPayload {
  givenName: string;
  familyName: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization token found in the request header.');
      return NextResponse.json(
        { authenticated: false, error: 'Authorization token missing or malformed' },
        { status: 401 }
      );
    }

    // Extract the token from the Authorization header
    const token = authHeader.substring(7); // Removing 'Bearer ' prefix

    // Verify the session token (JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

    // Assuming the token contains user info (e.g., name and email)
    const { givenName, familyName, email } = decoded;

    // Return the authenticated status along with user details
    return NextResponse.json({ authenticated: true, givenName, familyName, email });

  } catch (error) {
    console.error('Error verifying session token:', error);

    // Handle different types of errors
    if (error instanceof JsonWebTokenError) {
      console.error('JWT error:', error.message);
      return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 });
    } else if (error instanceof TokenExpiredError) {
      console.error('JWT token expired:', error.message);
      return NextResponse.json({ authenticated: false, error: 'Token expired' }, { status: 401 });
    } else {
      // General error handling
      console.error('Other error:', error);
      return NextResponse.json({ authenticated: false, error: 'Authentication failed' }, { status: 401 });
    }
  }
}
