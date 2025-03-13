import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { app, server, io } from "./lib/socket.js";
dotenv.config();
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";

const FRONTEND_URL = process.env.FRONTEND_URL;
const PORT = process.env.PORT;

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("<h1>Restful Service for MERN Chat Project!</h1>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/message", messageRouter);

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
