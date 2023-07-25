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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
	if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }

	// const body = JSON.parse(req.body)

	const { chain } = req.body;
	const { prompt } = req.body;

	const messages: ChatCompletionRequestMessage[] = [{
		role: 'user',
		content: prompt
	}];

	let response;
	try {
		response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo-0613",
			messages: messages
		});

		res.status(200).json({ response: response.data.choices[0].message })
		return;
	} catch (error: any) {
		console.log('/genChat2 err: ', error);
		res.status(500).json({ message: error.message, type: "Internal server error" });
		return
	}
}
