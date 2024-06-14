import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

import Replicate from "replicate";


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN as string,
});

const IMG_PROVIDER: "Stability" | "Replicate" = "Replicate";

const STABILITY_API_TOKEN = process.env.STABILITY_API_TOKEN;
if(!STABILITY_API_TOKEN) throw Error(`no api token ${STABILITY_API_TOKEN}`);



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

	console.log('imagine#prompt', prompt.logo_description_brief);

  try {

    if(IMG_PROVIDER === "Replicate") {
      const input = {
        cfg: 4.5,
        prompt: prompt.logo_description_brief,
        aspect_ratio: "3:2",
        output_format: "webp",
        output_quality: 79,
        negative_prompt: "ugly, distorted"
      };
      
      const image_json = await replicate.run("stability-ai/stable-diffusion-3", { input });
      console.log({image_json});
      return res.status(200).json({image_json});
    } else if(IMG_PROVIDER === "Stability") {
      const payload = {
        prompt: prompt.logo_description_brief,
        output_format: "jpeg"
      };
      const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
        axios.toFormData(payload, new FormData()),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: { 
            Authorization: `Bearer ${STABILITY_API_TOKEN}`,
            Accept: "image/*" 
          },
        },
      );

      const buffer = Buffer.from(response.data);
      const base64Image = buffer.toString('base64');
      const image_json = `data:image/jpeg;base64,${base64Image}`;


      if(response.status !== 200) 
        throw Error(`${response.status}: ${response.data.toString()}`);

      console.log('/api/iSD3 #b64Image');
      
      return res
        .status(200)
        .json({image_json});
    }
		
  } catch (error: any) {
    console.error('/api/iSD3 #error', error.message);
    return res
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
  }
}
