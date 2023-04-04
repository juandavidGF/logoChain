import { NextApiRequest, NextApiResponse } from "next";
const DALL_E = "https://api.openai.com/v1/images/generations";

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
    const response = await fetch(DALL_E, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        n: 4,
        size: "1024x1024",
      }),
    });
    const json = await response.json();
    return res.status(202).json({ id: json.messageId });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
  }
}
