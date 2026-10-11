import { app } from "./app";
import { env } from "./config/env";
const start = async () => {
  const port = env.port;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
};
start();