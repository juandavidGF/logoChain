// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

type ErrorResponse = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {	
	if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }

	const body = JSON.parse(req.body)
	const { prompt } = body

	const generateEndpoint = process.env.GENERATE_ENDPOINT;

	if (!generateEndpoint) {
		res.status(500).json({ error: 'Generate endpoint not defined' })
		return;
	}

	try {
		const response = await fetch(generateEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				product: prompt,
				num_samples: 1,
				temperature: 0.7,
			})
		})

		const data = await response.json()
		console.log('handler#data', data)

		res.status(200).json(data)
	} catch (error) {
		res.status(500).json({ error: 'Something went wrong' })
	}
}
