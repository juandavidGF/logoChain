import { NextApiRequest, NextApiResponse } from "next";

import Replicate from "replicate";


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN as string,
});

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
		const input = {
      cfg: 4.5,
      prompt: "a photo of vibrant artistic graffiti on a wall saying \"SD3 medium\"",
      aspect_ratio: "3:2",
      output_format: "webp",
      output_quality: 79,
      negative_prompt: "ugly, distorted"
    };
    
    const output = await replicate.run("stability-ai/stable-diffusion-3:", { input });
    console.log(output);
    return res.status(200).json(output);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
  }
}
