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

  try {

		const response = await openai.createImage({
			prompt: prompt,
			n: 2,
			size: "1024x1024",
		});
    // const response = await fetch(DALL_E, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
		// 		Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     prompt,
    //     n: 4,
    //     size: "1024x1024",
    //   }),
    // });
    // const json = await response.json();
		console.log(response.data)
    return res.status(200).json(response.data);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
  }
}
