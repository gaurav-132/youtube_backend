import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilepath) =>{
    try{
        if(!localFilepath) return "Could find the path";

        let response = await cloudinary.uploader.upload(localFilepath, { resource_type: 'auto' });
        console.log("File is uploaded on cloudinary", response);
        return response;
    }catch(error){
        fs.unlinkSync(localFilepath); //remove the locally saved temp file as the upload operation got failed
        return error;
    }
}

export { uploadOnCloudinary };