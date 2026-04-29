import express from "express";
import {  
  signIn, 
  signUp, 
  signOut, 
  verifyEmail, 
  resendEmailVerification, 
  forgotPassword, 
  updatePassword
} from "../../controllers/auth.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { prisma } from "../../lib/prisma.ts";

const router = express.Router();  

// PUBLIC: No middleware. 
// This allows the user to send their email/password and GET a token. 
router.post("/login", signIn);

router.get("/verify-email", requireAuth, verifyEmail);

router.post("/resend-verification", requireAuth, resendEmailVerification); 

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", updatePassword);

// Register user
router.post("/register", requireAuth, signUp);

// Me
router.get("/me", requireAuth, async (req, res) => {

  // If the middleware didn't find a user, return a guest response immediately
  if (!req.user) return res.json({ authenticated: false, user: null });
  
  const userInfo = await prisma.user.findFirst({ where: { id: req.user?.id } });

  if (!userInfo) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ 
    authenticated: true,
    user: req.user, 
    ...userInfo,
  });

   // return info of the logged in user from protect middleware (req.user)
});


// Logout user
router.post("/logout", signOut);

export default router;