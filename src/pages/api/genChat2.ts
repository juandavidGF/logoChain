// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai';
import isDomainAvailable from '@/utils/isDomainAvailable';
import { ChatCompletionFunctionRunnerParams } from 'openai/lib/ChatCompletionRunner';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

type Data = {
  name: string
}

interface WeatherInfo {
	location: string;
	temperature: string;
	unit: string;
	forecast: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
	if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }

	const body = JSON.parse(req.body)

	const { chain } = body;
	const { prompt } = body;

	let content;

	switch (chain) {
		case "design_brief":
			content = `can you suggest the identity brand assets for a company with this product?: 
			"${prompt.product}?"`
			break;
		default:
			throw new Error('chain not supported');
	}

	
	const tools: ChatCompletionTool[] = [
		{
			type: "function",
			function: {
				name: "getIdentityBrandAssets",
				description: "Get the identity brand assets for the product description",
				parameters: {
					type: "object",
					properties: {
						companyName: {
							type: "string",
							description: "The name of the company",
						},
						domain1: { 
							type: "string",
							description: "the web domain of the company"
						},
						domain2: { 
							type: "string",
							description: "different name suggestion for the company"
						},
						domain3: { 
							type: "string",
							description: "different name suggestion for the company"
						},
						slogan: {
							type: "string",
							description: "the slogan for the company"
						},
						tagline: {
							type: "string",
							description: "the tagline for the company"
						},
						logoPrompt: {
							type: "string",
							description: "the logo prompt to generate using LLMs like Dall-e"
						},
						whyTheLogo: {
							type: "string",
							description: "the reason because the logo was selected"
						}
					},
					required: ["companyName", "domain1", "domain2", "domain3", "slogan", "logoPrompt", "whyTheLogo"],
				},
			}
		}
	];

	const messages: ChatCompletionMessageParam[] = [{
		role: 'user',
		content: content
	}];

	console.log('content', content)

	try {
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: messages,
			tools: tools,
			tool_choice: "required",
		});
		
	
		let rMesssage = response.choices[0].message;
	
		console.log({rMesssage});
	
		if (rMesssage.tool_calls) {
			const { name, arguments: argu } = rMesssage.tool_calls[0].function;

			const args = JSON.parse(argu);
			
			let functionResponse;
	
			switch (name) {
				case 'getIdentityBrandAssets':
					functionResponse = await getIdentityBrandAssets(
						args.companyName,
						args.domain1,
						args.domain2,
						args.domain3,
						args.slogan,
						args.tagline,
						args.logoPrompt,
						args.whyTheLogo
					);
					break;
				default:
					throw new Error(`Function not implemented: ${name}`);
			}
	
			console.log('functionResponse: ', {name, args});
			
			res.status(200).json({ result: {name, args} })
			return
		} else {
			throw new Error(`Function call not implemented: `);
		}
	} catch (error: any) {
		console.error('/genChat2 err: ', error.message);
		res.status(500).json({ message: error.message, type: "Internal server error" });
		return
	}
	
}

async function getIdentityBrandAssets(
	companyName: string,
	domain1: string,
	domain2: string,
	domain3: string,
	slogan: string,
	tagline: string,
	logoPrompt: string,
	whyTheLogo: string
): Promise<any> {
	
	const designBrief = {
		companyName: companyName,
		domains: [
			{
				domain: domain1,
				available: await isDomainAvailable(domain1)
			},
			{
				domain: domain2,
				available: await isDomainAvailable(domain2)
			},
			{
				domain: domain3,
				available: await isDomainAvailable(domain3)
			}
		],
		slogan: slogan,
		tagline: tagline,
		logoPrompt: logoPrompt,
		whyTheLogo: whyTheLogo
	}

	return designBrief;
}