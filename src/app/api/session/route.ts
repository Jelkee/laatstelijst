import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

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
    console.log('Received token:', token); // Debugging line

    // Verify the session token (JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    console.log('Decoded JWT:', decoded); // Debugging line

    // Return the authenticated status
    return NextResponse.json({ authenticated: true });

  } catch (error) {
    console.error('Error verifying session token:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
