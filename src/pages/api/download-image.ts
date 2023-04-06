// pages/api/download-image.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Stream } from 'stream';

async function fetchImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).send({ error: 'Only GET requests allowed' });
    return;
  }

  const { url } = req.query;

  if (typeof url !== 'string') {
    res.status(400).send({ error: 'Missing or invalid "url" query parameter' });
    return;
  }

  try {
    const imageBuffer = await fetchImage(url);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'attachment; filename=image.jpg');
    res.send(imageBuffer);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching the image' });
  }
}
