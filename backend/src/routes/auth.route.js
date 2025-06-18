import express from "express";
const router = express.Router();
import {
  googleSignIn,
  facebookSignIn,
  appleSignIn,
  refreshToken,
  signOut,
  getCurrentUser,
  validateToken
} from "../controllers/auth.controller.js";
import { authenticate } from '../middlewares/auth.mddleware.js';

// Public routes
router.post('/google', googleSignIn);
router.post('/facebook', facebookSignIn);
router.post('/apple', appleSignIn);
router.post('/refresh-token', refreshToken);

// Protected routes (require valid JWT)
router.post('/sign-out', authenticate, signOut);
router.get('/me', authenticate, getCurrentUser);
router.get('/validate-token', authenticate, validateToken);

export default router;