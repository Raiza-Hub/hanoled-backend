import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import organizationRoutes from "./organization/organization.routes.js";
import adminRoutes from "./admin/admin.routes.js";
import memberRoutes from "./member/member.routes.js";

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

app.use("/api/organization", organizationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/member", memberRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
