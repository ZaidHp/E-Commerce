import axios from 'axios';

// export const downloadCanvasToImage = () => {
//   const canvas = document.querySelector("canvas");
//   const dataURL = canvas.toDataURL();
//   const link = document.createElement("a");

//   link.href = dataURL;
//   link.download = "canvas.png";
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

export const reader = (file) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });

export const getContrastingColor = (color) => {
  // Remove the '#' character if it exists
  const hex = color.replace("#", "");

  // Convert the hex string to RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate the brightness of the color
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black or white depending on the brightness
  return brightness > 128 ? "black" : "white";
};


// export const uploadImage = async (base64Image) => {
//   try {
//     const response = await fetch('http://localhost:8080/api/v1/image/upload', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image: base64Image })
//     });
    
//     const data = await response.json();
//     if (!data.success) throw new Error(data.error);
    
//     return data.url;
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error; // Re-throw for handling in components
//   }
// };


export const uploadImage = async (base64Image, folder) => {
  try {
    const response = await axios.post('http://localhost:8080/api/upload', {
      image: base64Image,
      folder: folder, // 'logos', 'textures', or 'products'
    });
    return response.data.path; // Returns "/uploads/[folder]/[filename].png"
  } catch (error) {
    console.error("Upload failed:", error);
    throw error; // Re-throw for handling in components
  }
};

// Capture canvas as image
export const downloadCanvasToImage = async () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('Canvas not found');
  
  const dataURL = canvas.toDataURL('image/png');
  return await uploadImage(dataURL, 'products'); // Uploads to 'products' folder
};
