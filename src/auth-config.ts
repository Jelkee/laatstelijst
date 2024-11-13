import { DatabaseManager } from '@/db';
import { user } from '@/schema';
import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utility to create a JWT token
function createJwtToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
}

// Utility to verify the JWT token (on protected routes)
function verifyJwtToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_token } = body;

    // Verify the ID token with Google OAuth2
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure this matches your Google client ID
    });

    const payload = ticket.getPayload();
    console.log('User authenticated:', payload);

    const db = DatabaseManager.getDatabase();

    if (!db || !db.query || !db.query.user) {
      console.error('Database client or user query model is not initialized.');
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Query the user by email
    const res = await db.query.user.findFirst({
      where: eq(user.email, payload?.email ?? ""), // Assuming email is unique
    });

    if (!res) {
      // If the user doesn't exist, create a new user
      await db.insert(user).values({
        givenName: payload?.given_name ?? "",
        familyName: payload?.family_name ?? "",
        email: payload?.email,
      });
      console.log('New user created:', payload);
    } else {
      console.log('Existing user found:', res);
    }

    // Create a session token (JWT) containing user information
    const sessionToken = createJwtToken({
      email: payload?.email,
      name: payload?.name,
    });

    // Send the JWT token as a response to the client (store this in client-side storage)
    const response = NextResponse.json({ user: payload, sessionToken });
    
    return response;

  } catch (error) {
    console.error('Error verifying ID token:', error);
    return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
  }
}

export async function verifySession(request: Request) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Extract the token from the Authorization header
    const token = authorizationHeader.replace('Bearer ', '');

    const verifiedPayload = verifyJwtToken(token);

    if (!verifiedPayload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Session is valid', user: verifiedPayload });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
