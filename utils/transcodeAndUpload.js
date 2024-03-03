import { v2 as cloudinary } from 'cloudinary';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { exec } from 'child_process';
import fs from 'fs';

// Configure FFmpeg path
const ffmpegPath = ffmpegInstaller.path;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "dulzq4kio",
  api_key: process.env.CLOUDINARY_API_KEY || 598324439822711,
  api_secret: process.env.CLOUDINARY_API_SECRET || "hCujMScODjh-SPoLNGLYK8ZaPtY",
});

const transcodeAndUpload = async (localFilepath) => {
  try {
    if (!localFilepath) {
      throw new Error("File path is missing.");
    }

    console.log('Starting transcoding and upload process...');

    // Adjust transcoding options for smaller file size
    const transcodedFilePath = `${localFilepath}_transcoded.mp4`;
    console.log('Transcoded file path:', transcodedFilePath);

    const ffmpegCommand = `${ffmpegPath} -i ${localFilepath} -vf scale=1280:-1 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k ${transcodedFilePath}`;
    console.log('FFmpeg command:', ffmpegCommand);

    await exec(ffmpegCommand);
    console.log('Transcoding completed.');

    // console.log(localFilepath); return;

    // Upload the transcoded video to Cloudinary
    let response = await cloudinary.uploader.upload(transcodedFilePath, { resource_type: 'video' });
    console.log('Cloudinary upload successful.');

    // Delete the transcoded file
    fs.unlinkSync(transcodedFilePath);
    console.log('Transcoded file deleted.');

    console.log("Transcoding and upload successful.");
    return response;
  } catch (error) {
    console.error("Error during transcoding and upload:", error);
    return { error: error.message };
  }
};

export { transcodeAndUpload };
