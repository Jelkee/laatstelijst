import { DatabaseManager } from '@/db';
import { user } from '@/schema';
import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Google OAuth2 client with your client ID from Google Developer Console
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

export async function POST(request: NextRequest) {
  try {
    // Ensure the request method is POST
    if (request.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Parse the incoming request body to get the ID token
    const { id_token } = await request.json();

    if (!id_token) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }

    // Verify the ID token with Google OAuth2
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure the token was issued for your app
    });

    // Extract the payload from the verified token
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid ID token payload' }, { status: 400 });
    }

    console.log('User authenticated:', payload);

    const db = DatabaseManager.getDatabase();

    // Check if the user already exists in the database
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, payload.email)
    });

    // If the user does not exist, create a new user in the database
    if (!existingUser) {
      await db.insert(user).values({
        id: payload.sub,  // Google user ID
        givenName: payload.given_name || '',
        familyName: payload.family_name || '',
        email: payload.email,
      });
      console.log('New user created:', payload);
    } else {
      console.log('Existing user found:', existingUser);
    }

    // Generate a JWT session token for the user
    const sessionToken = jwt.sign(
      {
        email: payload.email,
        givenName: payload.given_name,
        familyName: payload.family_name,
        id: payload.sub,
      },
      process.env.JWT_SECRET as string,  // Your JWT secret from environment variables
      { expiresIn: '1h' }  // Adjust expiration time as needed
    );

    // Return the generated JWT token in the response
    return NextResponse.json({ token: sessionToken });

  } catch (error) {
    console.error('Error verifying ID token or during authentication:', error);

    // Handle token expiry or other errors
    if (error instanceof Error && error.message.includes("Token used too late")) {
      return NextResponse.json({ error: 'ID token expired' }, { status: 401 });
    }

    // General error response
    return NextResponse.json({ error: 'Invalid ID token or error during authentication' }, { status: 401 });
  }
}
