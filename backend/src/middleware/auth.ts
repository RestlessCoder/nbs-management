import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "../express.d.ts"; 

// Middleware to protect routes and get user info from token
export const requireAuth = (
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
    };
    
    // 2. Now req.user has the role required for the next middleware
    req.user = decoded;
    
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
