import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authHeader = request.headers.get('Authorization');

    // Log the Authorization header for debugging
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization token found in the request header.');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Extract the token from the Authorization header
    const token = authHeader.substring(7); // Removing 'Bearer ' prefix
    console.log('Received token:', token); // Debugging line

    // Verify the session token (JWT)
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    console.log('Decoded JWT:', decoded); // Debugging line

    // Assuming the token contains user info (e.g., name and email)
    const { name, email } = decoded; // Extracting name and email from decoded payload

    // Return the authenticated status along with user details
    return NextResponse.json({ authenticated: true, name, email });

  } catch (error) {
    console.error('Error verifying session token:', error);

    // Log the error details to troubleshoot
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT error:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired:', error.message);
    } else {
      console.error('Other error:', error);
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
