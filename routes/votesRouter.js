import express from "express";
import { prisma } from "../index.js";

export const votesRouter = express.Router();

// Create Upvote
votesRouter.post("/upvotes/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Checks if you're logged in
    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login to upvote.",
      });
    }

    // Checks if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({
        success: false,
        error: "Post not found.",
      });
    }
    const upvote = await prisma.upvote.create({
      data: {
        postId,
        userId,
      },
    });
    res.send({
      success: true,
      upvote,
    });
  } catch (error) {
    return res.send({ success: false, error: error.message });
  }
});

// Create Downvote
votesRouter.post("/downvotes/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Checks if you're logged in
    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login to downvote.",
      });
    }

    // Checks if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({
        success: false,
        error: "Post not found.",
      });
    }
    const downvote = await prisma.downvote.create({
      data: {
        postId,
        userId,
      },
    });
    res.send({
      success: true,
      downvote,
    });
  } catch (error) {
    return res.send({ success: false, error: error.message });
  }
});

// Delete /upvotes/:postId

votesRouter.delete("/upvotes/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please log in to delete an upvote.",
      });
    }
    // Checks if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({
        success: false,
        error: "Post with that Id not found.",
      });
    }

    const deletedUpvote = await prisma.upvote.delete({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    res.send({
      success: true,
      deletedUpvote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Delete /downvotes/:postId

votesRouter.delete("/downvotes/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please log in to delete an downvote.",
      });
    }
    // Checks if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.send({
        success: false,
        error: "Post with that Id not found.",
      });
    }

    const deletedDownvote = await prisma.downvote.delete({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    res.send({
      success: true,
      deletedDownvote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
