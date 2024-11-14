// pages/api/auth.ts

import { DatabaseManager } from '@/db';
import { user } from '@/schema';
import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Google OAuth2 client with your client ID from Google Developer Console
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body to get the ID token
    const { id_token } = await request.json(); // Get the Google ID token from the body

    if (!id_token) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }

    // Verify the ID token with Google OAuth2
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // Make sure to check the audience for security
    });

    // Extract the payload from the verified token
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 400 });
    }

    console.log('User authenticated:', payload);
    const db = DatabaseManager.getDatabase();
    // Check if the user already exists in the database
    const existingUser = await db.query.user.findFirst({
      where: (eq(user.email, payload.email))
    });

    // If the user does not exist, create a new user in the database
    if (!existingUser) {
      await db.insert(user).values({
        givenName: payload.given_name ?? '', // Use the given name from the payload, or fallback to an empty string
        familyName: payload.family_name ?? '', // Use the family name from the payload, or fallback to an empty string
        email: payload.email, // Use the email from the payload
      });
      console.log('New user created:', payload);
    } else {
      console.log('Existing user found:', existingUser);
    }

    // Generate a JWT session token for the user
    const sessionToken = jwt.sign(
      { email: payload.email, name: payload.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' } // You can adjust the expiration time as needed
    );

    // Return the generated JWT token in the response
    return NextResponse.json({ token: sessionToken });

  } catch (error) {
    console.error('Error verifying ID token:', error);
    return NextResponse.json({ error: 'Invalid ID token or error during authentication' }, { status: 401 });
  }
}
