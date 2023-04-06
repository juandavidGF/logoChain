// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.API_KEY_SENDGRID as string);

type Data = {
  response?: any;
	error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }

	const { key, name, email } = req.body
	let response;

	const txt = `name: ${name}, email: ${email}, ${key}`;
	const subject = `novaBrand - ${key} - ${email}`;

	const msg = {
		to: 'juanchoda12@gmail.com', // Recipient
		from: 'support@artmelon.me', // Verified sender
		subject: subject,
		text: txt,
		html: `<strong>${txt}</strong>`,
	};

	try {
		response = await sgMail.send(msg);
	} catch (error: unknown) {
		console.error(error);
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'An unknown error occurred' });
		}
	}

	console.log('notify-suscriptor#response', response);

	res.status(200).json({response});
}
