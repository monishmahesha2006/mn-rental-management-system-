import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";
import { env } from "../../config/env";
const SALT_ROUNDS = 10;
export async function registerUser(params: {
  email: string;
  password: string;
  name?: string;
  role: "OWNER" | "TENANT";
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) {
    const err: any = new Error("Email already in use");
    err.statusCode = 400;
    throw err;
  }
  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash,
      role: params.role,
      name: params.name
    }
  });
  return createAuthResponse({
    ...user,
    role: user.role as "OWNER" | "TENANT"
  });
}
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err: any = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  return createAuthResponse({
    ...user,
    role: user.role as "OWNER" | "TENANT"
  });
}
function createAuthResponse(user: { id: string; email: string; role: "OWNER" | "TENANT"; name?: string | null }) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d"
  });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  };
}