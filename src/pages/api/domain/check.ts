// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
} | any

type ErrorResponse = {
  error: string
}

const URL = 'https://domain-checker7.p.rapidapi.com/whois?domain=';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {

	if(req.method !== 'POST') {
		res.status(405).send({ error: 'Only POST requests allowed' })
		return
	}

	const body = req.body;
	const { domain } = body;

	console.log('check#domain', domain);

	try {
		const response = await (await fetch(URL + domain, {
			method: 'GET',
			headers: {
				'X-RapidAPI-Key': 'c515399fb5msha53880bec6a1137p116da9jsne61de488081f',
				'X-RapidAPI-Host': 'domain-checker7.p.rapidapi.com'
			}
		})).json()

		console.log('check#response', response);

		return res.status(200).json(response)
	} catch (error: any) {
		return res
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
	}
}
