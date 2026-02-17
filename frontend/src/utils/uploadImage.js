
import api from "./api";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // Append the image file to the form data
    formData.append('image', imageFile);

    try {
        const response= await api.post('http://localhost:3000/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Assuming the response contains the image URL or relevant data
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

export default uploadImage;