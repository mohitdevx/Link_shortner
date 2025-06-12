import express from "express";
import { userRouter } from "./routes/user.route.js";
import cors from "cors";

export const app = express();

const appMiddlware = [
  express.json(),
  express.urlencoded({ extended: true }),
  cors(),
];

app.use("/api", appMiddlware, userRouter);
