export function parseBrandInfo(str: string): { [key: string]: any } | null {
  const regex = /([A-Za-z\s]+):\s(.+)(?:\n\n([A-Za-z\s]+):\s(.+))?\n\n([A-Za-z\s]+):\n((?:\d\.\s\S+\n)+\d\.\s\S+)(?:\n\n([A-Za-z\s]+):\n((?:\d\.\s@\S+\n)+\d\.\s@\S+))?/g;
  const match = regex.exec(str);

	console.log('str', str);

  if (!match) {
    return null;
  }

  const result: { [key: string]: any } = {};
  let i = 1;

  while (i < match.length) {
    const key = match[i].toLowerCase().replace(' ', '_');
    const value = match[i + 1];
    result[key] = key === 'web_domains' || key === 'social_media_handles'
      ? value.match(/\d\.\s(\S+)/g)?.map((match) => match.replace(/^\d\.\s/, '')) || []
      : value;
    i += 2;
  }

  return result;
}
