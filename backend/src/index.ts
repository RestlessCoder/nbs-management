import express from "express";
import cors from "cors";
import assetsRouter from "./routes/assetsRoute.ts";
import siteRouter from "./routes/siteRoute.ts";
import authRoutes from "./routes/authRoute.ts";
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

app.use("/api/sites", siteRouter);
app.use("/api/assets", assetsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

