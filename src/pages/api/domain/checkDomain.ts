// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { promisify } from 'util'
const whois = require('whois')

type Data = {
  available: any
}

type ErrorResponse = {
  message: string
}

const lookup = promisify(whois.lookup)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {

	const { domain } = req.query;

	console.log(domain);

	try {
		const data = await lookup(domain);
		
		console.log(data)

		const pattern = /^No match for domain/;
		const available = pattern.test(data);

		res.status(200).json({ available: available })
	} catch (error) {
		res.status(500).json({ message: 'Server error' })
	}
}