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
	let response;

	const { key, product, name, email } = req.body

	const subject = `Request a payment link to get credits -> logo.artmelon.me`;
	const txt = `You have requested one generation - logo.artmelon.me, <br/>
	product: ${product},<br/>
	user: ${name}, ${email}, <br/><br/>
	
	Do you want to get credits?,<br/><br/>

	10 credits, 5USD<br/>
	
	Respond yes and we will send you the payment link.<br/><br/>
	
	<3 Juan Granados:<br/>
	* https://twitter.com/juandavid_gf,<br/>
	* https://www.linkedin.com/in/juandavidgf/<br/>`;

	const msg = {
		to: email, // Recipient
		from: 'support@artmelon.me', // Verified sender
		cc: 'juan@artmelon.me',
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
