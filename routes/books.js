import { Router } from "express";
import { PrismaClient } from "../generated/prisma/index.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const booksRouter = Router();
const prisma = new PrismaClient();

booksRouter.post("/", authenticateUser, async (req, res) => {
  const { title, author, genre } = req.body;
  const id = req.user.userId;

  if (!title || !author || !genre) {
    res.status(400).json({ message: "Missing one or more input fields" });
    return;
  }

  try {
    const book = await prisma.book.create({
      data: {
        title: title,
        author: author,
        genre: genre,
        createdById: id,
      },
    });

    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add book" });
  }
});

booksRouter.get("/", async (req, res) => {
  const { page = 1, limit = 10, author, genre } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const filters = {};
  if (author) filters.author = { contains: author, mode: "insensitive" };
  if (genre) filters.genre = { contains: genre, mode: "insensitive" };

  try {
    const books = await prisma.book.findMany({
      where: filters,
      skip,
      take: Number(limit),
    });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch books" });
    return;
  }
});

booksRouter.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ message: "Search query is required" });
    return;
  }

  try {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            author: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    res.status(200).json({ books: books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to search books" });
    return;
  }
});

booksRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 5 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        reviews: {
          skip,
          take: Number(limit),
          select: {
            id: true,
            content: true,
            rating: true,
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    const avgRating = await prisma.review.aggregate({
      where: { bookId: id },
      _avg: { rating: true },
    });

    res.json({ ...book, averageRating: avgRating._avg.rating || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch book" });
    return;
  }
});

booksRouter.post("/:id/reviews", authenticateUser, async (req, res) => {
  const { id: bookId } = req.params;
  const userId = req.user.userId;
  const { description, rating } = req.body;

  if (!description || !rating) {
    res.status(400).json({ message: "Missing one or more input fields" });
    return;
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
    });

    if (existingReview) {
      return res
        .status(409)
        .json({ message: "This book has already been reviewed by you" });
    }

    const review = await prisma.review.create({
      data: {
        description: description,
        rating: Number(rating),
        userId: userId,
        bookId: bookId,
      },
    });
    res.status(201).json({
      message: "Review posted successfully",
      review: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to post review" });
    return;
  }
});

export default booksRouter;
