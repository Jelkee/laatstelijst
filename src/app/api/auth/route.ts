// src/app/api/auth/route.ts

import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_token } = body;

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure this matches your Google client ID
    });

    const payload = ticket.getPayload();
    console.log('User authenticated:', payload);

    return NextResponse.json({ user: payload });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
  }
}
