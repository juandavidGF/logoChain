// Assuming you have a type or interface for the function prepareImageFileForUpload
type PrepareImageFileForUploadFn = (file: File) => Promise<void>;

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

