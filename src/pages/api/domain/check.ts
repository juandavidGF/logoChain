
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
  res: NextApiResponse<Data>
) {

	if(req.method !== 'POST') {
		res.status(405).send({ error: 'Only POST requests allowed' })
		return
	}

	const body = req.body;
	const { domain } = body;

	try {
		const response = await fetch(URL + domain, {
			method: 'GET',
			headers: {
				'X-RapidAPI-Key': 'd72216071emshf4385a59c5c084ap176d62jsn306b5e377ec5',
				'X-RapidAPI-Host': 'domain-checker7.p.rapidapi.com'
			}
		})

		const data = await response.json()
		console.log('check#data', data);

		return res.status(200).json(data)
	} catch (error) {
		return res.status(500).json({ error: 'Something went wrong' })
	}
}
