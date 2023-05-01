// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { parseBrandInfo } from 	'@/utils/parseResponse';

type Data = {
  parsed: {};
}	| any

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

	const chain = "design_brief";
	const designBriefBr = "Company Name: Hola Co.<br/>Web domain: www.holaco.com<br/>Target Audience: Multicultural individuals interested in exploring new cultures, traditions and languages.<br/>Slogan: Explore the world with us.<br/>Tagline: Connecting cultures, one Hola at a time.";
	const designBriefNLine = designBriefBr.replace(/<br\/>/g, '\n');

	const parsed = parseBrandInfo(designBriefNLine);

	// console.log('tet/parser#parsed', parsed);

  res.status(200).json({parsed})
}
