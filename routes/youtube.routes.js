import express from 'express';
import { getCarauselData, getVideos } from '../controllers/youtube.controller.js';

const router = express.Router();

router.post("/get-carausel-data", getCarauselData);
router.post("/get-videos", getVideos);


export { router as youtubeRoutes };