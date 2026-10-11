import dotenv from "dotenv";
dotenv.config();
export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  jwtSecret: process.env.JWT_SECRET || "blr-rental-secret-key-change-in-production",
  nodeEnv: process.env.NODE_ENV || "development"
};
