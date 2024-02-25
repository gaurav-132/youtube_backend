import express from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { signUpSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post("/login", validate(loginSchema) ,login);
router.post("/register", validate(signUpSchema) ,register);

export { router as authRoutes};
