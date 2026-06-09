// express.d.ts gives you autocomplent(req.user.email) and type safefty (Indusry standard)


declare namespace Express  {
  interface Request {
    user?: { id: number; email: string; siteId: number; role: "ADMIN" | "USER"; isVerified: boolean }; 
  }
}

