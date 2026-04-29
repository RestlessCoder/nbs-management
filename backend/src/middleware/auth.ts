import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "../express.d.ts"; 
import { prisma } from "../../lib/prisma.ts";

// Middleware to protect routes and get user info from token
export const requireAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  
  const token = req.cookies.token;

  if(!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

  try {
     
    // 1. Tell TS that the decoded token has both id and role
   const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
      id: number; 
      role: "ADMIN" | "USER"; 
      isVerified: boolean;
    };
    
    // 2. Now req.user has the role and verification status required for the next middleware
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "User not found" });

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role as "ADMIN" | "USER",
        isVerified: user.isVerified,
      };
    
    next();

  } catch (error) { 
    return res.status(401).json({ message: "Invalid token" });
  }

}

// Role-based access
export const requireRole = (roles: string[] = []) => {
  return (req: Request, 
          res: Response, 
          next: NextFunction
    ) => {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      if (!req.user.role || !roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden: You do not have the required role" });
    next();
  };
}

// Middleware to check if user is verified
export const requireVerified = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (!req.user?.isVerified) {
    return res.status(403).json({ message: "Please verify your account first." });
  }

  next();
}