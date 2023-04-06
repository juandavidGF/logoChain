import { NextApiRequest, NextApiResponse } from "next";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

	if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }

	const body = JSON.parse(req.body)
	const { prompt } = body

	console.log('imagine#prompt', prompt);

  try {
		const response = await openai.createImage({
			prompt: prompt.logo_description_brief,
			n: 4,
			size: "1024x1024",
		});
    return res.status(200).json(response.data.data);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
  }
}
