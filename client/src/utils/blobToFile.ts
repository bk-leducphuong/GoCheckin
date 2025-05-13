export const blobToFile = (
  blob: Blob,
  filename: string,
  lastModified: number = Date.now()
) => {
  return new File([blob], filename, { type: blob.type, lastModified });
};
