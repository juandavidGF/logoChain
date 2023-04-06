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

	// console.log('chat#chain', chain);
	// console.log('chat#prompt', prompt);

	try {
		const content = chain === "company_name" ?
				`What is a good name for a company that makes: ${prompt}?`
			: chain === "company_slogan_tagline_domains" ?
					`Create a slogan and tagline for ${prompt.product} that makes ${prompt.description}, and suggest 3 web domains`
				: chain === "logo_description" ?
					`take this examples of prompts for dall-e to create nice icon/logs:

					1. Modern startup logo with no text, symmetrical, minimalistic, speed flash fast grocery delivery icon, centered, gradient, dark background.
					2. appicon style, Create a minimalistic and modern logo for a blog post titled 'Maximizing Efficiency as an Indie Entrepreneur: Time Management and Prioritization Tips'. The logo should represent the concepts of time management, productivity, and entrepreneurship., flat icon
					3. a tech company new logo, minimalistic, geometric, futuristic, stable diffusion, trending on artstation, sharp focus, studio photo, intricate details, highly detailed, by greg rutkowski.
					4. A cute blue baby birdie, logo in a dark circle as the background, vibrant, adorable, bubbles, cheerful.
					5. A slanting rectangle shape in red and black minimal logo in dark circle as the background, vibrant, 3d isomorphic.
					
					Now try to combine the features for the company: ${prompt.company_name}, and product: ${prompt.product}, to reflect the brand, and create a new and simple prompt for the logo/icon.
					And pleas specify that the logo must not contain letters.
					`
					: chain === "design_brief" ?
						`product description: ${prompt.product}
						
						Based in the given product description give me a design brief with next items:

						Company Name:
						Web domain:
						Target Audience:
						slogan:
						tagline:`
							: chain === "logo_description_brief" ? `
							design brief: ${prompt.design_brief},

							create a prompt for a log, imagine a concept for like animal, object, colorez, using just keywords, responde just with a string, please specify in dont use the company name, or letters, text
							` :(() => { throw new Error('chain not supported') })();

		// console.log('imagine#chain+content', chain, content)
	
		const completion = await openai.createChatCompletion({
			// model: "gpt-4",
			model: "gpt-3.5-turbo",
			messages: [{ "role": "system", "content": content }]
		});
		res.status(200).json({ result: completion.data.choices[0].message });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
