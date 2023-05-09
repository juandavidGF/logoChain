import { Configuration, OpenAIApi } from "openai";
import { parseBrandInfo } from '@/utils/parseResponse';
import isDomainAvailable from '@/utils/isDomainAvailable';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const domainCheckerURL = 'https://domain-checker7.p.rapidapi.com/whois?domain=';

export default async function(req, res) {
	if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }

	const body = JSON.parse(req.body)

	const { chain } = body;
	const { prompt } = body;

	console.log('api/chat#chain inputxxxxxxxxxx:  ', chain, 'prompt: ', prompt);

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
				
				Based on the given product description, give me a design brief with the next items, and please respond just the [response] in the language used for the product description, but the :

				Company name: [response]
				Web domain: [response]
				Target audience: [response]
				slogan: [response]
				tagline: [response]`;
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
					
					Create a short Prompt to generate an icon fewer than 20 words based on an imaginary combined analogy concept like some object, animal, or geometry figure. Specify the form, background, elements, shapes, features, style, colors, location of each element, symmetry, and do not use the company name or product name.
					`;
					break;
				case "logo_description_why":
					content = `product: -> response: [${prompt.product}],
					design brief: ${prompt.design_brief},
					icon composition: ${prompt.logo_description_brief},

					Baed in the last information,

					think step by step, and Identify the language used for the product response in the [ ], and use thas language to respond me why the icon composition was choosen
					`;
					break;
				case "get_domain":
					content = `product: ${prompt.product},
					company_name: ${prompt.company_name},

					suggest 3 web domains different than ${prompt.domain} than doesnt exist. and related with the company name and product.`;
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

		console.log('chat#chain after case switch: ', chain)
	
		const completion = await openai.createChatCompletion({
			// model: "gpt-4",
			model: "gpt-3.5-turbo",
			messages: [{ "role": "system", "content": content }]
		});

		// console.log('chat#completionxxxxxxxxx: ', completion.data.choices[0].message.content)

		let parseCompletion = chain === 'logo_description_brief_+why' ?
			parseBrandInfo(completion.data.choices[0].message.content, chain)
			: chain === 'design_brief' ?
				parseBrandInfo(completion.data.choices[0].message.content, chain)
				: completion.data.choices[0].message.content

		console.log('flag#parseCompletion: ', parseCompletion)
		
		if(chain === 'design_brief') {
			let domain = parseCompletion['Web domain'];
			console.log('-> genChat#if design_brief#domain: ', domain);
			let available = await isDomainAvailable(domain);
			// Check domain is one string (domain) or several
			let domainAvailabilityArr = [{
				domain: domain,
				available: available
			}];
			parseCompletion['Web domain'] = domainAvailabilityArr;
		} else if(chain === 'get_domain') {
			let domains = parseCompletion.split('\n').map(dom => extractDomain(dom));
			if (domains.length > 3) domains = domains.slice(0, 3);
			console.log('-> genChat#if get_#domains: ', domains);
			let domainAvailabilityArr = await Promise.all(domains.map(async (domain) => {
				let available = await isDomainAvailable(domain)
				if(available) {
					return {
						domain: domain,
						available: available
					};
				}
			}));
			domainAvailabilityArr = domainAvailabilityArr.filter(domain => domain !== undefined);
			parseCompletion = domainAvailabilityArr;
		}
		
		console.log('api/chat#parseCompletionxxxxxxxxxxxxxxxxxx: ', chain, parseCompletion);

		res.status(200).json({ result: parseCompletion });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

const checkDomainAvailability = async (domain) => {
	console.log('flag1#checkDomainAvailability');
	let domainAvailibilityRaw = await fetch("/api/domain/checkDomain?domain=" + domain, {
		method: 'GET',
		headers: {
			
		}
	})
	
	const domainAvailibility = await domainAvailibilityRaw.json();

	console.log('flag2#checkDomainAvailability', domainAvailibility);
	return domainAvailibility['available'] && domainAvailibility['valid'];
}

const checkDomainAvailabilityRapidApi = async (domain) => {
	console.log('flag1#checkDomainAvailability');
	let domainAvailibilityRaw = await fetch(domainCheckerURL + domain, {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '865a60322emsh190b1e5d1514b87p1486e9jsnc6b6b777b188',
			'X-RapidAPI-Host': 'domain-checker7.p.rapidapi.com'
		}
	})
	
	const domainAvailibility = await domainAvailibilityRaw.json();

	console.log('flag2#checkDomainAvailability', domainAvailibility);
	return domainAvailibility['available'] && domainAvailibility['valid'];
}

function extractDomain(input) {
  // Split the input string by space
  const parts = input.split(' ');

  // Check if the first letter of the first part is a number
  if (/^\d/.test(parts[0])) {
    // Return the second part if the first part starts with a number
    return parts[1];
  } else {
    // Otherwise, return the first part
    return parts[0];
  }
}
