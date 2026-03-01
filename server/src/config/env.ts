import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/blr_rental",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  nodeEnv: process.env.NODE_ENV || "development"
};

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("[env] DATABASE_URL not set, using default local connection string.");
}
