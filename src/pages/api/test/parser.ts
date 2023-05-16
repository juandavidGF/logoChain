// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { parseBrandInfo, parseDesignBrief } from 	'@/utils/parseResponse';

type Data = {
  parsed: {};
}	| any

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

	
	const parsed = parseDesignBrief("");

	console.log(parsed)

	// console.log('tet/parser#parsed', parsed);

  res.status(200).json({parsed})
}
