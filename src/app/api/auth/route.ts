import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_token } = body; // This is the Google ID token

    // Verify the ID token with Google OAuth2
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('User authenticated:', payload);

    // Create a JWT token for the user
    const sessionToken = jwt.sign(
      { email: payload?.email, name: payload?.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Return the JWT token in the response
    return NextResponse.json({ token: sessionToken });  // Return token to the client

  } catch (error) {
    console.error('Error verifying ID token:', error);
    return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
  }
}
