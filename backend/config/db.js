import { connect } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const connectionDB = async () => {
  try {
    let uri =
      process.env.MONGO_URI ||
      "mongodb://root:example@127.0.0.1:27017/LinkShortener?authSource=admin";

    // If no database name specified, insert /LinkShortener before query parameters or at end
    if (!uri.includes("/LinkShortener") && !uri.includes("/linkshortener")) {
      if (uri.includes("?")) {
        uri = uri.replace("?", "/LinkShortener?");
      } else {
        uri = `${uri.replace(/\/+$/, "")}/LinkShortener`;
      }
    }

    const connectionInstance = await connect(uri);
    console.log(
      `Connected to Database Successfully! ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.error(`Error Connecting to Database: ${err.message}`);
    process.exit(1);
  }
};
