// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

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

	const product = `La empresa se llama soluciones electrohidráulicas,
	La empresa se dedica al mantenimiento de sistemas de bombeo, mantenimiento plantas 
	eléctricas, instalación hidráulicas, lavado de tanque, para edificios y casas campestres
	Busca Garantizar que las familias que habitan en edificios y casas cuenten con el 
	servicio de agua y la calidad de la misma, se ha creado confianza con los clientes
	Valores:
	honestidad - cumplimiento - confianza - opción - experiencia`

	const messages: ChatCompletionRequestMessage[] = [{ 
		role: 'user', 
		content: `Give me a suggestion for the identity brand assets for this product: ${product} ` 
	}];

	const functions = [
		// {
		// 	name: "getCurrentWeather",
		// 	description: "Get the current weather in a given location",
		// 	parameters: {
		// 		type: "object",
		// 		properties: {
		// 			location: {
		// 				type: "string",
		// 				description: "The city and state, e.g. San Francisco, CA",
		// 			},
		// 			unit: { type: "string", enum: ["celsius", "fahrenheit"] },
		// 		},
		// 		required: ["location"],
		// 	},
		// },
		{
			name: "getIdentityBrandAssets",
			description: "Get the identity brand assets for a company",
			parameters: {
				type: "object",
				properties: {
					companyName: {
						type: "string",
						description: "The name of the company",
					},
					domain: [{
						type: "string",
						description: "The web domain of the company of the company",
					}],
					slogan: { 
						type: "string",
						description: "the slogan of the company"
					},
					tagline: {
						type: "string", 
						description: "the tagline of the company"
					},
					logoDescription: {
						type: "string", 
						description: "the short prompt for the logo description to use to generate it with generative AI"
					},
				},
				required: ["companyName", "domain", "slogan", "tagline", "logoDescription"],
			},
		}
	];


	let response;
	try {
		// response = await openai.createChatCompletion({
		// 	// model: "gpt-4",
		// 	model: "gpt-3.5-turbo-0613",
		// 	messages: messages,
		// 	functions: functions,
		// 	function_call: "auto"
		// });
		response = await openai.createChatCompletion({
			// model: "gpt-4",
			model: "gpt-3.5-turbo-0613",
			messages: messages,
			functions: functions,
			function_call: "auto"
		});
	} catch (error) {
		console.log('error: ', error);
		throw new Error('error calling chatGPT');
	}

	let responseMessage = response.data.choices[0].message;

	console.log('responseMessage: ', responseMessage);

	if (responseMessage?.function_call) {
		let function_name = responseMessage.function_call.name;
		let functionArgs;
		if (responseMessage.function_call && responseMessage.function_call.arguments) {
			functionArgs = JSON.parse(responseMessage.function_call.arguments);
		} else {
			console.log('arguments failed to get')
			throw new Error(`Function not implemented: ${function_name}`);
		}
		let functionResponse;

		switch (function_name) {
			case 'getCurrentWeather':
				functionResponse = getCurrentWeather(functionArgs.location, functionArgs.unit);
				break;
			// Add more cases if you have more functions
			case 'getIdentityBrandAssets':
				functionResponse = getIdentityBrandAssets(
					functionArgs.companyName,
					functionArgs.domain,
					functionArgs.slogan,
					functionArgs.tagline,
					functionArgs.logoDescription
				)
				break;
			default:
				throw new Error(`Function not implemented: ${function_name}`);
		}

		console.log('functionResponse: ', functionResponse);
		
	} else {
		console.log("not calling function")
	}

  res.status(200).json({ name: "Jhon Doe"})
}


function getIdentityBrandAssets(companyName: string, slogan: string, tagline: string,  domain: string, logoDescription: string) {
	console.log()
	if(companyName && slogan && tagline && domain && logoDescription) return  {
		companyName: companyName,
		slogan: slogan,
		tagline: tagline,
		domain: domain,
		logoDescription: logoDescription
	}
	else return 0
}


function getCurrentWeather(location: string, unit: string = "fahrenheit"): string {
	const weatherInfo: WeatherInfo = {
			location: location,
			temperature: "72",
			unit: unit,
			forecast: ["sunny", "windy"],
	}
	return JSON.stringify(weatherInfo);
}