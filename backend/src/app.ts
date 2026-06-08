import express from "express";
import cors from "cors";
import assetsRouter from "./routes/assetsRoute";
import jobsRouter from "./routes/jobsRoute";
import siteRouter from "./routes/siteRoute";
import authRoutes from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import dashboardRoutes from "./routes/dashboardRoute";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],    
}));


app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to NBS Management System");
});

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/users", userRouter);
app.use("/api/sites", siteRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/assets", assetsRouter);

// Only listen to port if running locally (Vercel handles routing automatically)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;