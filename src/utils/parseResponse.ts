export function parseBrandInfo(str: string): { [key: string]: any } | null {
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
