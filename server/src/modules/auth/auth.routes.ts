import { Router } from "express";
import { prisma } from "../../prisma/client";
import { requireAuth } from "../../middleware/auth";
import { loginUser, registerUser } from "./auth.service";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: { message: "email, password and role are required" } });
    }
    if (role !== "OWNER" && role !== "TENANT") {
      return res.status(400).json({ error: { message: "role must be OWNER or TENANT" } });
    }

    const result = await registerUser({ email, password, name, role });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { message: "email and password are required" } });
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ error: { message: "User not found" } });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

