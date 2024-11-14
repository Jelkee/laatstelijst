import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Define the type for the decoded JWT payload
interface CustomJwtPayload extends JwtPayload {
  name: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization token found in the request header.');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Extract the token from the Authorization header
    const token = authHeader.substring(7); // Removing 'Bearer ' prefix

    // Verify the session token (JWT)
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not defined.');
      return NextResponse.json({ authenticated: false }, { status: 500 });
    }

    // Decode the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as CustomJwtPayload;

    // Assuming the token contains user info (e.g., name and email)
    const { name, email } = decoded;

    // Return the authenticated status along with user details
    return NextResponse.json({ authenticated: true, name, email });

  } catch (error) {
    console.error('Error verifying session token:', error);

    // Log the error details to troubleshoot
    if (error instanceof JsonWebTokenError) {
      console.error('JWT error:', error.message);
    } else if (error instanceof TokenExpiredError) {
      console.error('JWT token expired:', error.message);
    } else {
      console.error('Other error:', error);
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
