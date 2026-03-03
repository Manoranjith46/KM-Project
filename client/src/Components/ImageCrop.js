

export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  
  // Wait for the image to load
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to match the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,      // x position to start clipping
    pixelCrop.y,      // y position to start clipping
    pixelCrop.width,  // width of clipped image
    pixelCrop.height, // height of clipped image
    0,                // x position on canvas
    0,                // y position on canvas
    pixelCrop.width,  // width of image to use
    pixelCrop.height  // height of image to use
  );

  // Return the cropped image as a Blob (File) and URL
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (!file) {
        reject(new Error('Canvas is empty'));
        return;
      }
      // Create a File object with proper name
      const fileWithName = new File([file], 'cropped-document.jpeg', { type: 'image/jpeg' });
      // Returns both URL and the file blob
      resolve({ url: URL.createObjectURL(fileWithName), file: fileWithName }); 
    }, 'image/jpeg', 1);
  });
};

/**
 * Handle file change and prepare for cropping
 * @param {Event} e - File input change event
 * @param {Function} setTempPreviewUrl - State setter for temp preview
 * @param {Function} setShowCropModal - State setter for showing crop modal
 * @param {Function} setErrors - State setter for errors
 * @param {Function} setTouched - State setter for touched fields
 */
export const handleFileChange = (e, setTempPreviewUrl, setShowCropModal, setErrors, setTouched) => {
  const file = e.target.files[0];
  
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, document: 'File size must be less than 5MB' }));
      setTouched(prev => ({ ...prev, document: true }));
      return;
    }

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onload = (event) => {
      setTempPreviewUrl(event.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  }
};

/**
 * Handle crop upload after cropping is complete
 * @param {string} tempPreviewUrl - Temporary preview URL
 * @param {Object} croppedAreaPixels - Pixel data of cropped area
 * @param {Function} setPreviewUrl - State setter for preview URL
 * @param {Function} setForm - State setter for form
 * @param {Function} setShowCropModal - State setter for showing crop modal
 * @param {Function} setTouched - State setter for touched fields
 * @param {Function} setErrors - State setter for errors
 * @param {Object} form - Current form state
 * @param {Object} touched - Current touched state
 * @param {Object} errors - Current errors state
 */
export const handleCropUpload = async (
  tempPreviewUrl,
  croppedAreaPixels,
  setPreviewUrl,
  setForm,
  setShowCropModal,
  setTouched,
  setErrors,
  form,
  touched,
  errors
) => {
  if (tempPreviewUrl && croppedAreaPixels) {
    try {
      const croppedImage = await getCroppedImg(tempPreviewUrl, croppedAreaPixels);
      setPreviewUrl(croppedImage.url);
      setForm({ ...form, document: croppedImage.file });
      setShowCropModal(false);
      setTouched({ ...touched, document: true });
      setErrors({ ...errors, document: '' });
    } catch (error) {
      console.error("Error cropping image:", error);
      setErrors({ ...errors, document: 'Failed to crop image' });
    }
  }
};

/**
 * Handle clearing the preview image
 * @param {Function} setPreviewUrl - State setter for preview URL
 * @param {Function} setForm - State setter for form
 * @param {Object} form - Current form state
 */
export const handleClearPreview = (setPreviewUrl, setForm, form) => {
  setPreviewUrl(null);
  setForm({ ...form, document: null });
};

/**
 * Handle closing the crop modal
 * @param {Function} setShowCropModal - State setter for showing crop modal
 * @param {Function} setTempPreviewUrl - State setter for temp preview
 * @param {Function} setCrop - State setter for crop position
 * @param {Function} setZoom - State setter for zoom level
 */
export const handleCloseCropModal = (setShowCropModal, setTempPreviewUrl, setCrop, setZoom) => {
  setShowCropModal(false);
  setTempPreviewUrl(null);
  setCrop({ x: 0, y: 0 });
  setZoom(1);
};

/**
 * Handle crop reset (reset position and zoom)
 * @param {Function} setCrop - State setter for crop position
 * @param {Function} setZoom - State setter for zoom level
 */
export const handleResetCrop = (setCrop, setZoom) => {
  setCrop({ x: 0, y: 0 });
  setZoom(1);
};