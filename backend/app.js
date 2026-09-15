import express from "express";
import { userRouter } from "./routes/user.route.js";
import cors from "cors";

export const app = express();

const appMiddlware = [
  express.json(),
  express.urlencoded({ extended: true }),
  cors(),
];

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api", appMiddlware, userRouter);
