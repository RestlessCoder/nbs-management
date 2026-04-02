import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (userId: number) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
    });
}

export const signUp = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const { name, email, password, role } = req.body;

    // 1. Validate
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
        },
    });

    const token = generateToken(newUser.id);

    res.cookie("token", token,  cookieOptions);

    return res.status(201).json({ 
        message: "User registered successfully", 
        user: { 
            id: newUser.id, 
            name: newUser.name, 
            email: newUser.email, 
            role: newUser.role,
        }
    });

};

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

    // 4. Generate JWT
    const token = generateToken(user.id);       

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ 
        message: "Login successful", 
        token,  
        user: { 
            id: user.id, 
            name: user.name,            
            email: user.email,
            role: user.role,
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