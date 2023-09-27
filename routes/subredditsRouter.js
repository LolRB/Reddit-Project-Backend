import express from "express";
import { prisma } from "../index.js";

export const subredditsRouter = express.Router();

// GET /subreddits
subredditsRouter.get("/", async (req, res) => {
  try {
    const subreddit = await prisma.subreddit.findMany();
    const data = {
      success: true,
      subreddit,
    };
    res.json({ data });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// POST /subreddits
subredditsRouter.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.send({
        success: false,
        error: "Invalid subreddit name.",
      });
    }
    if (!req.user) {
      return res.send({
        success: false,
        error: "Login to create a subreddit.",
      });
    }
    const subreddit = await prisma.subreddit.create({
      data: {
        userId: req.user.id,
        name,
      },
    });
    res.send({
      success: true,
      subreddit,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /subreddit/:subredditId
subredditsRouter.delete("/:subredditId", async (req, res) => {
  try {
    const { subredditId } = req.params;
    const userId = req.user.id;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Login to delete a subreddit.",
      });
    }

    // Checks if subreddit exists
    const subreddit = await prisma.subreddit.findUnique({
      where: { id: subredditId },
    });

    if (!subreddit) {
      return res.send({
        success: false,
        error: "Subreddit not found.",
      });
    }
    // Checks the same user that created subreddit is the same trying to delete
    if (userId !== subreddit.userId) {
      return res.send({
        success: false,
        error: "You must be the owner of this subreddit to delete!",
      });
    }

    const deletedSubreddit = await prisma.subreddit.delete({
      where: { id: subredditId },
    });
    res.send({
      success: true,
      deletedSubreddit,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
