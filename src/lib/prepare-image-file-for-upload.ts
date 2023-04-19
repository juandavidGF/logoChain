const sharp = require('sharp');

async function fetchAndConvertImage(imgURL: string): Promise<Buffer> {
  const response = await fetch(imgURL);
  const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

async function prepareImageFileForUpload(buffer: Buffer): Promise<string> {
  const MAX_WIDTH = 512;
  const MAX_HEIGHT = 512;

  const resizedBuffer = await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  const dataURL = `data:image/png;base64,${resizedBuffer.toString('base64')}`;
  return dataURL;
}

export async function processImages(images: string[]): Promise<string[]> {
  const imagesBuffers = await Promise.all(images.map(imgURL => fetchAndConvertImage(imgURL)));
  return Promise.all(imagesBuffers.map(buffer => prepareImageFileForUpload(buffer)));
}
