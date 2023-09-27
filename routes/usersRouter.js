import express from "express";
import { prisma } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const usersRouter = express.Router();

// Login a user
usersRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({
        success: false,
        error:
          "You must provide a valid username and password when logging in.",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.send({
        success: false,
        error: "User and/or password is invalid.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.send({
        success: false,
        error: "User and/or password is invalid.",
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

// Register a user

usersRouter.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if the user already exists
    const checkUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (checkUser) {
      return res.send({
        success: false,
        error: "Username already exists, please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Read user token to get req
usersRouter.get("/token", async (req, res) => {
  try {
    res.send({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
