import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function(req, res) {
	if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }

	const body = JSON.parse(req.body)

	const { chain } = body;
	const { prompt } = body;

	console.log('api/chat#req.body', body);
	console.log('api/chat#chain', chain)
	console.log('api/chat#prompt', prompt)

	const content = chain === "company_name" ? 
		`What is a good name for a company that makes: ${prompt}?`
		: chain === "company_logo_description" ?
			`Write a description of a logo for this company: ${prompt}`
			: undefined;

	console.log('api/chat#content', content);

	try {
		const completion = await openai.createChatCompletion({
			// model: "gpt-4",
			model: "gpt-3.5-turbo",
			messages: [{ "role": "system", "content": content }]
		});
		// console.log('completion', completion);
		res.status(200).json({ result: completion.data.choices[0].message });
	} catch (error) {
		console.log('api/chat#error', error);
		res.status(500).json({ error: error.message });
	}
}