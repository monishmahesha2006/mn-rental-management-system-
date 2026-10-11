import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Try loading server/.env or root .env
const serverEnvPath = path.resolve(__dirname, "../../.env");
const localEnvPath = path.resolve(__dirname, "../../../server/.env");
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
  dotenv.config();
}

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  jwtSecret: process.env.JWT_SECRET || "blr-rental-secret-key-change-in-production",
  nodeEnv: process.env.NODE_ENV || "development"
};

// Ensure Prisma has DATABASE_URL in process.env
process.env.DATABASE_URL = env.databaseUrl;

