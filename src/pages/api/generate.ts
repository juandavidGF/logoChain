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

	
	if (req.method === 'POST') {
		const { prompt } = req.body

		console.log('prompt', prompt)

		const generateEndpoint = process.env.GENERATE_ENDPOINT;


    if (!generateEndpoint) {
      res.status(500).json({ error: 'Generate endpoint not defined' })
      return;
    }
		
		const response = await fetch(generateEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: prompt,
				num_samples: 1,
				temperature: 0.7,
			})
		})

		const data = await response.json()

		console.log('data', data)


		res.status(200).json(data)
	} else {
		res.status(400).json({ error: 'Invalid request method' })
	}
}
