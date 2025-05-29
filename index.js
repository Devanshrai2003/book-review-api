import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";

import userRouter from "./routes/users.js";
import booksRouter from "./routes/books.js";
import reviewsRouter from "./routes/reviews.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/books", booksRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.json({ status: "Book Review API is live" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
