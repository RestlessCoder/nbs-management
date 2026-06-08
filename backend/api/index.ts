import app from "../src/app";

// Vercel entry point
export default (req: any, res: any) => {
  app(req, res);
};
