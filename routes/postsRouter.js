import express from "express";
import { prisma } from "../index.js";

export const postsRouter = express.Router();

postsRouter.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
        subreddit: true,
        upvotes: true,
        downvotes: true,
        children: true,
      },
    });
    const data = {
      success: true,
      posts,
    };
    res.json({ data });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

postsRouter.post("/", async (req, res) => {
  try {
    const { title, text, subredditId } = req.body;
    if (!text || !subredditId) {
      return res.send({
        success: false,
        error:
          "Please include both text and subredditId when creating a post/comment.",
      });
    }
    if (!req.user) {
      return res.send({
        success: false,
        error: "Please log in to submit a post.",
      });
    }
    const post = await prisma.post.create({
      data: {
        title,
        text,
        userId: req.user.id,
        subredditId,
      },
    });
    res.send({
      success: true,
      post,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Update Posts by Id

postsRouter.put("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { title, text } = req.body;
  const userId = req.user.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    // Checks if you're logged in
    if (!req.user) {
      return res.send({
        success: false,
        error: "Please log in to update a post.",
      });
    }
    // Checks if post exists
    if (!post) {
      return res.send({
        success: false,
        error: "Post not found.",
      });
    }
    // Checks the same user that posted is the same trying to update
    if (userId !== post.userId) {
      return res.send({
        success: false,
        error: "You must be the owner of this post to update!",
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        text,
        userId,
      },
    });

    res.send({
      success: true,
      updatedPost,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Delete /posts/:postId

postsRouter.delete("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!req.user) {
      return res.send({
        success: false,
        error: "Please log in to delete a post.",
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
    // Checks the same user that posted is the same trying to update
    if (userId !== post.userId) {
      return res.send({
        success: false,
        error: "You must be the owner of this post to delete!",
      });
    }

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    res.send({
      success: true,
      deletedPost,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
