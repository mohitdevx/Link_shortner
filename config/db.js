import { connect } from "mongoose";
import dotenv from "dotenv"
dotenv.config();

export const connectionDB = async () => {
    try {
        await connect(`${process.env.MONGO_URI}/LinkShortener`).then((connectionInstence) => {
            console.log(`Connected to Database Successfully! ${connectionInstence.connection.host}`)
        })
    } catch (err) {
        console.log(`Error Connecting to Database: ${err.message}`);
        process.exit(1);
    }
}