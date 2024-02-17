const express = require('express');
const { login, register } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { signUpSchema, loginSchema } = require('../validators/authValidator');
const router = express.Router();


router.post("/login", validate(loginSchema) ,login);
router.post("/register", validate(signUpSchema) ,register);

module.exports =  router;
