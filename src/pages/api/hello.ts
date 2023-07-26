// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

	// if (req.method !== 'POST') {
  //   res.status(405).send({ error: 'Only POST requests allowed' })
  //   return
  // }

	// console.log(req.body)


  res.status(200).json({ name: 'John Doe' })
}
