// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import isDomainAvailable from '@/utils/isDomainAvailable';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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

	
	const functions = [
		{
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
		},
		// {
		// 	name: "getDomain",
		// 	description: "get the different domain for the company",
		// 	parameters: {
		// 		type: "object",
		// 		properties: {
					
		// 		}

		// 	}
		// }
	];

	const messages: ChatCompletionRequestMessage[] = [{
		role: 'user',
		content: content
	}];

	console.log('content', content)

	try {
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo-0613",
			messages: messages,
			functions: functions,
			function_call: "auto"
		});
		
	
		let responseMessage = response.data.choices[0].message;
	
		console.log('responseMessage: ', responseMessage);
	
		if (responseMessage?.function_call) {
			let function_name = responseMessage.function_call.name;
			let functionArgs;
			if (responseMessage.function_call && responseMessage.function_call.arguments) {
				functionArgs = JSON.parse(responseMessage.function_call.arguments);
			}
			let functionResponse;
	
			switch (function_name) {
				case 'getIdentityBrandAssets':
					functionResponse = await getIdentityBrandAssets(
						functionArgs.companyName,
						functionArgs.domain1,
						functionArgs.domain2,
						functionArgs.domain3,
						functionArgs.slogan,
						functionArgs.tagline,
						functionArgs.logoPrompt,
						functionArgs.whyTheLogo
					);
					break;
				default:
					throw new Error(`Function not implemented: ${function_name}`);
			}
	
			console.log('functionResponse: ', functionResponse);
			
			res.status(200).json({ result: functionResponse })
			return
		}
	} catch (error: any) {
		console.log('/genChat2 err: ', error);
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

	return JSON.stringify(designBrief);
}