import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectionDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const uri = rawUri.endsWith("/LinkShortener")
      ? rawUri
      : `${rawUri.replace(/\/+$/, "")}/LinkShortener`;

    const connectionInstance = await connect(uri);
    console.log(
      `Connected to Database Successfully! ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.error(`Error Connecting to Database: ${err.message}`);
    process.exit(1);
  }
};
