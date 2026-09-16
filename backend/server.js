import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { app } from "./app.js";
import { connectionDB } from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const server = http.createServer(app);
const port = process.env.PORT || 5000;

connectionDB().then(() => {
  server.listen(port, () =>
    console.log(`Server is running on port http://localhost:${port}`)
  );
});
