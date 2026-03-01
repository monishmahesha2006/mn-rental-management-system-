import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { ownerRouter } from "./modules/owner/owner.routes";
import { tenantRouter } from "./modules/tenant/tenant.routes";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
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

app.use(errorHandler);

export { app };


