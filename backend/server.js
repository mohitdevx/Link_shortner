import "dotenv/config";
import http from "http";
import { app } from "./app.js";
import { connectionDB } from "./config/db.js";

const server = http.createServer(app);

connectionDB().then(() => {
  server.listen(process.env.PORT || 5000, () =>
    console.log(
      `Server is running on port http://localhost:${process.env.PORT || 5000}`
    )
  );
});
