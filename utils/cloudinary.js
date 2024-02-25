import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
cloud_name: process.env.CLOUDINARY_NAME || "dulzq4kio", 
  api_key: process.env.CLOUDINARY_API_KEY || 598324439822711, 
  api_secret: process.env.CLOUDINARY_API_SECRET || "hCujMScODjh-SPoLNGLYK8ZaPtY", 
});

const uploadOnCloudinary = async (localFilepath) =>{
    try{
        if(!localFilepath) return "Could find the path";

        let response = await cloudinary.uploader.upload(localFilepath, { resource_type: 'auto' });
        fs.unlinkSync(localFilepath);
        return response;
    }catch(error){
        fs.unlinkSync(localFilepath); //remove the locally saved temp file as the upload operation got failed
        return error;
    }
}

export { uploadOnCloudinary };