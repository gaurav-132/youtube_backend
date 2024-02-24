import { Contact } from '../models/contact.model.js';
// const data = require('../utils/youtubeData/dummyVideosData.mjs');

const getCarauselData = async (req, res) => {
    const carauselData = ["All", "Mixes", "Tamil Cinema", "Dramedy", "Music","Live","Mantras", "Programming", "Javascript", "Data Structure"];

    return res.status(200).json({ carauselData  });
}

const getVideos = async (req, res) => {
    try {
        const data = await import('../utils/youtubeData/dummyVideosData.mjs');
        return res.status(200).json({ videos: data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export { getCarauselData, getVideos };