import { v2 as cloudinary } from 'cloudinary';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure FFmpeg 
const ffmpegPath = ffmpegInstaller.path;

// Configure Cloudinary
cloudinary.config({
     cloud_name: process.env.CLOUDINARY_NAME || "dulzq4kio",
     api_key: process.env.CLOUDINARY_API_KEY || 598324439822711,
     api_secret: process.env.CLOUDINARY_API_SECRET || "hCujMScODjh-SPoLNGLYK8ZaPtY",
});

const __filename = fileURLToPath(import.meta.url);
const destinationDir = 'public/temp';

const transcodeAndUpload = async (videoFilePath) => {
     try {
         const transcodedFileName = `videoFile-${Date.now()}-${Math.floor(Math.random() * 1000000000)}.mp4_transcoded_${Date.now()}.mp4`;
         const transcodedFilePath = path.join(destinationDir, transcodedFileName);
 
         const ffmpegCommand = `${ffmpegPath} -i ${videoFilePath} -vf scale=1280:-1 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k ${transcodedFilePath}`;
 
         await new Promise((resolve, reject) => {
             exec(ffmpegCommand, (error, stdout, stderr) => {
                 if (error) {
                     console.log('Error during transcoding:', error);
                     reject(error);
                     return;
                 }
                 console.log('Transcoding completed.');
                 resolve();
             });
         });
 
         // Check if the transcoded file exists
         if (!fs.existsSync(transcodedFilePath)) {
             throw new Error(`Transcoded file not found: ${transcodedFilePath}`);
         }
         
 
         const result = await cloudinary.uploader.upload(transcodedFilePath, { resource_type: 'video' });
 
         fs.unlinkSync(videoFilePath);
         fs.unlinkSync(transcodedFilePath);
 
         return result;
     } catch (error) {
         fs.unlinkSync(videoFilePath);
         fs.unlinkSync(transcodedFilePath);
 
         console.log('Error during transcoding and upload:', error);
         return { error: error.message };
     }
 };
 

export { transcodeAndUpload };