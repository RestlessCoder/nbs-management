import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendPasswordResetEmail, sendVerificationEmail } from '../src/services/emailService';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (id: number, email: string, role: "ADMIN" | "USER", isVerified: boolean) => {
    return jwt.sign({id, email, role, isVerified }, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
    });
}

export const signUp = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const { name, email, password, role , siteId, gender } = req.body;

    // 1. Validate
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!gender) return res.status(400).json({ message: "Gender is required" });
    if (!siteId) return res.status(404).json({ message: "Site not found" });

    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({ where: { email }});
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });
    

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate verification token
    const verifyToken = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
  
    // Create user in DB
    const newUser = await prisma.user.create({
        data: {
            name: name,
            email,
            password: hashedPassword,
            role: role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
            site: { connect: { id: Number(siteId) } },
            gender: gender?.toUpperCase() === "GUY" ? "GUY" : "GIRL",
            verificationToken: verifyToken ? verifyToken : "",
            isVerified: false,
        },
    });

    await sendVerificationEmail(name, email, verifyToken);

    if (req.user?.role === "ADMIN") {
      // Admin is creating another user → don’t log in the new user
      return res.status(201).json({
        message: "User registered successfully. Verification email sent.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          siteId: newUser.siteId,
          gender: newUser.gender,
        },
      });

    } else {
        // Normal self‑signup → issue login cookie
        const loginToken = generateToken(newUser.id, newUser.email, newUser.role, newUser.isVerified);

        res.cookie("token", loginToken, cookieOptions);
    
        return res.status(201).json({ 
            message: "User registered successfully. Please verify your email.", 
            user: { 
                id: newUser.id, 
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role,
                siteId: newUser.siteId,
                gender: newUser.gender,
                isVerified: newUser.isVerified
            }
        });
    }
};

export const verifyEmail = async (
    req: Request,
    res: Response,
) => {
    const { token } = req.query;

    if(!token) return res.status(400).json({ message: "Verification token is required" });
    
    try {
        // Verify token
        const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!) as {
            id: number;
            email: string;
        };

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email: decoded.email } });
        
        if(!user) return res.status(401).json({ message: "This verification token is invalid or not associated with this account" });

        if (user?.isVerified) return res.status(200).json({ message: "Email already verified" });

        if (user?.verificationToken !== token) {
            return res.status(400).json({ message: "Invalid token" });
        }
        // Update user as verified
        const updatedUser = await prisma.user.update({
            where: { email: decoded.email },
            data: { isVerified: true, verificationToken: null },
        });

        // Generate a new token (JWT)
        const verifyToken = generateToken(updatedUser.id, updatedUser.email, updatedUser.role, updatedUser.isVerified);

        res.cookie("token", verifyToken,  cookieOptions);

        return res.status(200).json({
            message: "Email verified successfully.",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                siteId: updatedUser.siteId,
                gender: updatedUser.gender,
                isVerified: updatedUser.isVerified,
            },
        });
    
    } catch (error) {
        return res.status(400).json({ 
            message: (error as any).name === "TokenExpiredError" ? 
                "Verification token has expired. Please request a new verification email." 
                : "Verification Error" });
    }
};

export const resendEmailVerification = async (
    req: Request,
    res: Response,
) => {
    try {
         // Find user by ID from auth middleware
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });

        if (!user) return res.status(404).json({ message: "User not found" })
        if (user.isVerified) return res.status(400).json({ message: "User already verified" });
        
        // Generate a new token
        const resendVerifyToken = generateToken(user.id, user.email, user.role, user.isVerified);
        
        // Save token in DB
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: resendVerifyToken },
        });

        // Send email (reuse your mailer function)
        await sendVerificationEmail(updatedUser.name, updatedUser.email, updatedUser.verificationToken!);
        
        res.cookie("token", resendVerifyToken, cookieOptions);

        res.json({ message: "Verification email resent" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error resending verification email" });
    }

}

export const signIn = async (
    req: Request, 
    res: Response, 
) => {
    const { email, password } = req.body;   

    // 1. Validate
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    // 2. Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ message: "No user found with this email" });      

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    // 4. Generate JWT token and set cookie
    const token = generateToken(user.id, user.email, user.role, user.isVerified);

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ 
        message: `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} login successful`,
        token,  
        user: { 
            id: user.id, 
            name: user.name,            
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        }     
    });    
};

export const signOut = async (
    req: Request,
    res: Response,     
) => {
    res.cookie("token", "", { ...cookieOptions, maxAge: 1 });

    return res.status(200).json({ message: "Logged out successfully" });

}      

export const forgotPassword = async (
    req: Request,
    res: Response,
) => {
    
    try {
        const { email } = req.body;     

        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await prisma.user.findUnique({ where: { email } });  

        if (!user) return res.status(404).json({ message: "Email not found" });

        const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET as string, { expiresIn: "15min" });
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        await prisma.user.update({  
            where: { email: user.email },
            data: { 
                resetPasswordToken: user.resetPasswordToken,
                resetPasswordExpires: user.resetPasswordExpires 
            },
        });

        await sendPasswordResetEmail(user.name, user.email, resetToken);

        return res.status(200).json({ message: "Password reset email sent" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error resending forgot password request" });
    }
}

