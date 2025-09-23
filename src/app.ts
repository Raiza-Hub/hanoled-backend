import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors"
import { errorHandler } from "./middleware/errorHandler.js";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";


const app = express();
const port = process.env.PORT;



app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.all("/api/auth/{*splat}", toNodeHandler(auth));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(errorHandler);


app.get("/api/me", async (req, res) => {
  try {
    console.log('Received cookies:', req.headers.cookie);

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers), // convert Express headers
    });


    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // session.user contains user details from Better Auth
    return res.json({
      success: true,
      user: session.user,
    });
  } catch (err) {
    console.error("Session error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
