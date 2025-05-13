export const validateImages = (
  files: File[],
  maxSize: number = 5 * 1024 * 1024,
  maxCount: number = 3
) => {
  // Add file size validation
  const oversizedFiles = files.filter((file) => file.size > maxSize);
  if (oversizedFiles.length > 0) {
    alert(
      `Some files exceed the ${maxSize} limit. Found ${oversizedFiles.length} oversized files`
    );
    return;
  }

  // Add file type validation
  const invalidFiles = files.filter((file) => !file.type.match(/^image\//));
  if (invalidFiles.length > 0) {
    alert(
      `Only image files are allowed. Found ${invalidFiles.length} invalid files`
    );
    return;
  }

  if (files.length > maxCount) {
    alert(
      `You can only upload up to ${maxCount} images. Found ${files.length} files`
    );
    return;
  }
};
