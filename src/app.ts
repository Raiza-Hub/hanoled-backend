import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectDb } from "./db/connectDb";

const app = express();
const port = process.env.PORT;

connectDb();

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
