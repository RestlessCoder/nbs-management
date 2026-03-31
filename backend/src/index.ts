import express from "express";
import cors from "cors";
import assetsRouter from "./routes/assetsRoute.ts";
import assetsSiteRouter from "./routes/assetsSite.ts";


const app = express();
const PORT = 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",    
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to NBS Management System");
});

app.use("/api/sites", assetsSiteRouter);
app.use("/api/assets", assetsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});