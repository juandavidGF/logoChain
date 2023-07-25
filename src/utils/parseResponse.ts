import { DesighBrief } from '@/models/generation'

export function parseBrandInfo(str: string, chain = 'default'): { [key: string]: any } | null {
	const lines = str.split('\n');
	const result: { [key: string]: any } = {};

	let key = '';
	let value = '';

	for (const line of lines) {
		const match = line.match(/^([^:\n]+):\s*(.*)/);

		if (match) {
			if (key) {
				result[key] = parseValue(value);
			}
			key = match[1].trim();
			value = match[2].trim();
		} else {
			value += `\n${line.trim()}`;
		}
	}

	if (key) {
		result[key] = parseValue(value);
	}

	if (Object.keys(result).length === 0) {
		return null;
	}

	return result;
}

function parseValue(value: string): any {
	if (value.match(/^\d+\.\s/)) {
		const items = value
			.split('\n')
			.map((item) => item.trim().replace(/^\d+\.\s/, ''))
			.filter((item) => item !== '');

		const parsedList: { [key: string]: any } = {};

		for (const item of items) {
			const match = item.match(/^(\d+)\.\s*(.*)/);
			if (match) {
				parsedList[match[1]] = match[2];
			}
		}

		return parsedList;
	} else {
		return value;
	}
}

export function parseDesignBrief(str: string) {
	const data: any = {};

	// const strTest =  [
	// 	'Yes, the language used in the given text is Spanish.',
	// 	'',
	// 	'Suggestions for the design brief elements:',
	// 	'',
	// 	'1. Company name: "TechMovil"',
	// 	'2. Web domain: techmovil.com',
	// 	'3. Target audience: jóvenes y adultos que buscan un dispositivo móvil con buen rendimiento y diseño moderno (young adults who are looking for a mobile device with good performance and modern design)',
	// 	'4. Slogan: "Haz que cada momento cuente" (Make every moment count)',
	// 	'5. Tagline: "Diseño innovador y tecnología de vanguardia" (Innovative design and cutting-edge technology)'
	// ]

	// console.log('parseDesignBrief#input: ', strTest);

	const items = str.split("\n");

	console.log('parseDesignBrief#items split: ', str);

	for (let item of items) {
		const number = parseInt(item[0]);
		let colonIndex = item.indexOf(":");
		if (!isNaN(number)) {
			switch (number) {
				case 1:
					data["Company name"] = item.substring(colonIndex + 1).trim();
					break;
				case 2:
					data["Web domain"] = item.substring(colonIndex + 1).trim();
					break;
				case 4:
					data["Slogan"] = item.substring(colonIndex + 1).trim();
					break;
				case 5:
					data["Tagline"] = item.substring(colonIndex + 1).trim();
					break;
				default:
					break;
			}
		}
	}

	return data;
}
