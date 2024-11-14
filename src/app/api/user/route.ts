import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization token found in the request header.');
      return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
    }

    // Extract the token from the Authorization header
    const token = authHeader.substring(7); // Removing 'Bearer ' prefix
    console.log('Received token:', token); // Debugging line

    // Verify the session token (JWT)
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Assuming the token contains user info like name and email
    const { name, email } = decoded;

    // Return the user's name and email
    return NextResponse.json({ name, email });

  } catch (error) {
    console.error('Error verifying session token:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 401 });
  }
}
