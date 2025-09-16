import { toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { auth } from "./lib/auth";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./auth/auth.routes";

const app = express();

const port = process.env.PORT;

app.all("/api/auth", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(errorHandler);

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
