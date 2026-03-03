/**
 * Encodes a File or Blob object to a Base64 string
 * 
 * @param {File | Blob} fileOrBlob - The image file or blob to encode
 * @returns {Promise<string>} A promise that resolves with the Base64 string (data URL format)
 * @throws {Error} If the file cannot be read or is invalid
 * 
 * @example
 * const base64String = await encodeImageToBase64(myFile);
 * // Returns: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 */
export const encodeImageToBase64 = (fileOrBlob) => {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!fileOrBlob || !(fileOrBlob instanceof File || fileOrBlob instanceof Blob)) {
      reject(new Error('Invalid input: Expected a File or Blob object'));
      return;
    }

    const reader = new FileReader();

    // Handle successful read
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file: No result returned'));
      }
    };

    // Handle errors
    reader.onerror = (error) => {
      reject(new Error(`FileReader error: ${error}`));
    };

    // Start reading the file as Data URL (Base64)
    reader.readAsDataURL(fileOrBlob);
  });
};

/**
 * Decodes a Base64 string to a File object
 * 
 * @param {string} base64String - The Base64 string (data URL format) to decode
 * @param {string} fileName - The desired name for the output file (e.g., "profile.jpg")
 * @returns {File} A File object containing the decoded image data
 * @throws {Error} If the Base64 string is invalid or cannot be decoded
 * 
 * @example
 * const file = decodeBase64ToFile("data:image/jpeg;base64,/9j/4AAQSkZJRg...", "profile.jpg");
 * // Returns: File object with name "profile.jpg"
 */
export const decodeBase64ToFile = (base64String, fileName) => {
  try {
    // Validate input
    if (!base64String || typeof base64String !== 'string') {
      throw new Error('Invalid input: Expected a Base64 string');
    }

    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid input: Expected a file name');
    }

    // Extract MIME type and Base64 data
    // Format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid Base64 string format. Expected data URL format (data:mime;base64,...)');
    }

    const mimeType = matches[1]; // e.g., "image/jpeg"
    const base64Data = matches[2]; // e.g., "/9j/4AAQSkZJRg..."

    // Decode Base64 to binary string
    const binaryString = atob(base64Data);

    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the byte array
    const blob = new Blob([bytes], { type: mimeType });

    // Create and return a File object
    const file = new File([blob], fileName, { type: mimeType });

    return file;
  } catch (error) {
    throw new Error(`Failed to decode Base64 to File: ${error.message}`);
  }
};

/**
 * Utility function to validate if a string is a valid Base64 data URL
 * 
 * @param {string} base64String - The string to validate
 * @returns {boolean} True if valid Base64 data URL, false otherwise
 * 
 * @example
 * isValidBase64DataURL("data:image/jpeg;base64,/9j/4AAQSkZJRg..."); // true
 * isValidBase64DataURL("invalid string"); // false
 */
export const isValidBase64DataURL = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }
  
  const base64Pattern = /^data:([^;]+);base64,(.+)$/;
  return base64Pattern.test(base64String);
};

/**
 * Extracts the MIME type from a Base64 data URL
 * 
 * @param {string} base64String - The Base64 data URL
 * @returns {string | null} The MIME type (e.g., "image/jpeg") or null if invalid
 * 
 * @example
 * getMimeTypeFromBase64("data:image/jpeg;base64,/9j/..."); // "image/jpeg"
 */
export const getMimeTypeFromBase64 = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return null;
  }
  
  const matches = base64String.match(/^data:([^;]+);base64,/);
  return matches ? matches[1] : null;
};
