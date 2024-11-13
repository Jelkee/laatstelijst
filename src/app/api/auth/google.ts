import { OAuth2Client } from 'google-auth-library';
import type { NextApiRequest, NextApiResponse } from 'next';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface RequestBody {
  id_token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { id_token }: RequestBody = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID, // Ensure this matches your Google client ID
      });

      const payload = ticket.getPayload();
      console.log('User authenticated:', payload);

      res.status(200).json({ user: payload });
    } catch (error) {
      console.error('Error verifying ID token:', error);
      res.status(401).json({ error: 'Invalid ID token' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
