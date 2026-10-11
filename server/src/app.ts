import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { ownerRouter } from "./modules/owner/owner.routes";
import { tenantRouter } from "./modules/tenant/tenant.routes";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(express.json());

app.use("/static", express.static("static"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", environment: env.nodeEnv });
});

app.use("/api/auth", authRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/tenant", tenantRouter);
app.use("/api/payments", paymentsRouter);

// Serve static frontend assets if available (e.g., in production or single-server deployment)
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/static")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use(errorHandler);

export { app };