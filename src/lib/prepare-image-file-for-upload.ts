// Function to convert Blob to File
function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type, lastModified: new Date().getTime() });
}

async function fetchAndConvertImage(imgURL: string): Promise<File> {
  const response = await fetch(imgURL);
  const blob = await response.blob();
  const fileName = imgURL.split('/').pop() as string;
  const file = blobToFile(blob, fileName);
  return file;
}

async function prepareImageFileForUpload(file: File): Promise<string> {
  return new Promise((resolve: (dataUrl: string) => void, reject: (error: DOMException | Error) => void) => {
    const fr = new FileReader();
    fr.onerror = () => {
			if (fr.error) {
        reject(fr.error);
      } else {
        reject(new DOMException('FileReader error with unknown cause.'));
      }
    };
    fr.onload = (e: ProgressEvent<FileReader>) => {
      const img = document.createElement("img");
      img.onload = function () {
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;

        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            width = MAX_WIDTH;
            height = height * (MAX_WIDTH / width);
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

				if (!ctx) {
          reject(new Error('Failed to get 2D rendering context.'));
          return;
        }
				
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);
        const dataURL = canvas.toDataURL(file.type);

        resolve(dataURL);
      };
      img.src = e.target?.result as string;
    };
    fr.readAsDataURL(file);
  });
}

export async function processImages(images: string[]): Promise<string[]> {
  const imagesFiles = await Promise.all(images.map(imgURL => fetchAndConvertImage(imgURL)));
  return Promise.all(imagesFiles.map(img => prepareImageFileForUpload(img)));
}