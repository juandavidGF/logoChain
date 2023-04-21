import { Configuration, OpenAIApi } from "openai";
import { parseBrandInfo } from '../../utils/parseResponse'

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
	console.log('api/chat#chain inputxxxxxxxxxx:  ', chain, 'prompt: ', prompt)

	try {

		let content;
		switch (chain) {
			case "company_name":
				content = `What is a good name for a company that makes: ${prompt}?`;
				break;
			case "company_slogan_tagline_domains":
				content = `Create a slogan and tagline for ${prompt.product} that makes ${prompt.description}, and suggest 3 web domains`;
				break;
			case "logo_description":
				content = `take this examples of prompts for dall-e to create nice icon/logs:

				1. Modern startup logo with no text, symmetrical, minimalistic, speed flash fast grocery delivery icon, centered, gradient, dark background.
				2. appicon style, Create a minimalistic and modern logo for a blog post titled 'Maximizing Efficiency as an Indie Entrepreneur: Time Management and Prioritization Tips'. The logo should represent the concepts of time management, productivity, and entrepreneurship., flat icon
				3. a tech company new logo, minimalistic, geometric, futuristic, stable diffusion, trending on artstation, sharp focus, studio photo, intricate details, highly detailed, by greg rutkowski.
				4. A cute blue baby birdie, logo in a dark circle as the background, vibrant, adorable, bubbles, cheerful.
				5. A slanting rectangle shape in red and black minimal logo in dark circle as the background, vibrant, 3d isomorphic.
				
				Now try to combine the features for the company: ${prompt.company_name}, and product: ${prompt.product}, to reflect the brand, and create a new and simple prompt for the logo/icon.
				And please specify that the logo must not contain letters.
				`;
				break;
			case "design_brief":
				content = `product description: ${prompt.product}
				
				Based on the given product description, give me a design brief with the next items:

				Company Name:
				Web domain:
				Target Audience:
				slogan:
				tagline:`;
				break;
			case "logo_description_brief_+why":
				content = `product: ${prompt.product},
				design brief: ${prompt.design_brief},

				I need two items based on the last information and respond in this format:

				Prompt: ,
				Why:

				The Prompt should describe an icon with fewer than 30 words based on an imaginary combined analogy concept like some object, animal, or geometry figure. Specify the form, background, elements, shapes, features, style, colors, location of each element, symmetry, and do not use the company name or product name in the description.

				The Why is the reason behind the prompt icon composition.
				`;
				break;
				case "logo_description_brief":
					content = `product: ${prompt.product},
					design brief: ${prompt.design_brief},

					based in the last information,
					
					Create a Prompt to generate an icon fewer than 30 words based on an imaginary combined analogy concept like some object, animal, or geometry figure. Specify the form, background, elements, shapes, features, style, colors, location of each element, symmetry, and do not use the company name or product name.
					`;
					break;
			default:
				throw new Error('chain not supported');
		}		
		// const content = chain === "company_name" ?
		// 		`What is a good name for a company that makes: ${prompt}?`
		// 	: chain === "company_slogan_tagline_domains" ?
		// 			`Create a slogan and tagline for ${prompt.product} that makes ${prompt.description}, and suggest 3 web domains`
		// 		: chain === "logo_description" ?
		// 			`take this examples of prompts for dall-e to create nice icon/logs:

		// 			1. Modern startup logo with no text, symmetrical, minimalistic, speed flash fast grocery delivery icon, centered, gradient, dark background.
		// 			2. appicon style, Create a minimalistic and modern logo for a blog post titled 'Maximizing Efficiency as an Indie Entrepreneur: Time Management and Prioritization Tips'. The logo should represent the concepts of time management, productivity, and entrepreneurship., flat icon
		// 			3. a tech company new logo, minimalistic, geometric, futuristic, stable diffusion, trending on artstation, sharp focus, studio photo, intricate details, highly detailed, by greg rutkowski.
		// 			4. A cute blue baby birdie, logo in a dark circle as the background, vibrant, adorable, bubbles, cheerful.
		// 			5. A slanting rectangle shape in red and black minimal logo in dark circle as the background, vibrant, 3d isomorphic.
					
		// 			Now try to combine the features for the company: ${prompt.company_name}, and product: ${prompt.product}, to reflect the brand, and create a new and simple prompt for the logo/icon.
		// 			And pleas specify that the logo must not contain letters.
		// 			`
		// 			: chain === "design_brief" ?
		// 				`product description: ${prompt.product}
						
		// 				Based in the given product description give me a design brief with next items:

		// 				Company Name:
		// 				Web domain:
		// 				Target Audience:
		// 				slogan:
		// 				tagline:`
		// 					: chain === "logo_description_brief" ? `
		// 					prouct: ${prompt.product},
    //           design brief: ${prompt.design_brief},

		// 					I need two items based in the last information, and respond in this format,

		// 					Prompt: ,
		// 					Why: 

    //           the Promt describe a icon with minues than 30 words based an imaginary combined analogy concept like some object, animal or geometry figure, specify the form, background, elemtens, shapes, features, style, colors, ubication of each element, symetry, and not use the company name or product name in the description

		// 					the Why, is the reason behind the prompt icon composition.

		// 					` :(() => { throw new Error('chain not supported') })();

		console.log('chat#chain: ', chain)
	
		const completion = await openai.createChatCompletion({
			// model: "gpt-4",
			model: "gpt-3.5-turbo",
			messages: [{ "role": "system", "content": content }]
		});

		// console.log('chat#completionxxxxxxxxx: ', completion.data.choices[0].message.content)

		const parseCompletion = chain === 'logo_description_brief_+why' ?
			parseBrandInfo(chain, completion.data.choices[0].message.content)
			: completion.data.choices[0].message.content
		
		console.log('api/chat#parseCompletionxxxxxxxxxxxxxxxxxx: ', chain, parseCompletion)
		res.status(200).json({ result: parseCompletion });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
