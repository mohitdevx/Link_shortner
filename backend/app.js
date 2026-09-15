import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user.route.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const healthHandler = (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use("/api", userRouter);
