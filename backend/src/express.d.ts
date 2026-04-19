// express.d.ts gives you autocomplent(req.user.email) and type safefty (Indusry standard)


declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: "ADMIN" | "USER" };
    }
  }
}

export {};