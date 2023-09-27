import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { postsRouter } from "./routes/postsRouter.js";
import { usersRouter } from "./routes/usersRouter.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { subredditsRouter } from "./routes/subredditsRouter.js";
import { votesRouter } from "./routes/votesRouter.js";

dotenv.config();
export const prisma = new PrismaClient();
const app = express();

// tell express we are going to use json
app.use(express.json());
app.use(cors());

// we want an auth middleware that fires before every
// request and checks if theres a token and checks if that token is valid and grabs the user info and stores it in req.user
// logged in back end? req.user

app.use(async (req, res, next) => {
  // check if theres an auth token in header and console it
  try {
    if (!req.headers.authorization) {
      return next();
    }

    const token = req.headers.authorization.split(" ")[1];

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return next();
    }
    delete user.password;
    req.user = user;
    next();
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/subreddits", subredditsRouter);
app.use("/votes", votesRouter);

app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Welcome to reddit backend.",
  });
});

// Error messages
app.use((error, req, res, next) => {
  res.send({
    success: false,
    errror: error.message,
  });
});

app.use((req, res) => {
  res.send({
    success: false,
    errror: "No route found.",
  });
});

app.listen(3000, () => console.log("Server is up!"));
