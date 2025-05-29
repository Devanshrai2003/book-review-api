import { Router } from "express";
import { PrismaClient } from "../generated/prisma/index.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const reviewsRouter = Router();
const prisma = new PrismaClient();

reviewsRouter.put("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { description, rating } = req.body;
  const userId = req.user.userId;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });
    if (!existingReview || existingReview.userId !== userId) {
      res.status(400).json({
        message:
          "The review either does not exist or is not associated with your account",
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        description: description,
        rating: Number(rating),
      },
    });
    res.status(201).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update review" });
    return;
  }
});

reviewsRouter.delete("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review || review.userId !== userId) {
      res.status(403).json({ message: "Not allowed to delete this review" });
      return;
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
    return;
  }
});

export default reviewsRouter;
