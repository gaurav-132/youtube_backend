const express = require('express');
const router = express.Router();
const { getCarauselData, getVideos } = require('../controllers/YoutubeDataController');

router.post("/get-carausel-data", getCarauselData);
router.post("/get-videos", getVideos);


module.exports =  router;