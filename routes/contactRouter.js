const express = require('express');
const router = express.Router();
const { contactForm } = require('../controllers/contactController');

router.post("/contact", contactForm);


module.exports =  router;