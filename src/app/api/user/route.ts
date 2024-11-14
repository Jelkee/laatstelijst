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
      return NextResponse.json({ error: 'Authorization token missing or malformed' }, { status: 401 });
    }

    // Extract the token from the Authorization header
    const token = authHeader.substring(7); // Removing 'Bearer ' prefix

    // Ensure that the JWT_SECRET environment variable is defined
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined.');
      return NextResponse.json({ error: 'Internal server error: JWT_SECRET missing' }, { status: 500 });
    }

    // Verify the session token (JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as CustomJwtPayload;

    // Extract user data from the decoded payload
    const { givenName, familyName, email } = decoded;

    // Return the user's name and email
    return NextResponse.json({ givenName, familyName, email });

  } catch (error) {
    console.error('Error verifying session token:', error);

    // Handle specific JWT errors and return appropriate responses
    if (error instanceof JsonWebTokenError) {
      console.error('JWT error:', error.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    } else if (error instanceof TokenExpiredError) {
      console.error('JWT token expired:', error.message);
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ error: 'Failed to verify token' }, { status: 401 });
    }
  }
}
