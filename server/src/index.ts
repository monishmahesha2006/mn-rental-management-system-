import { app } from "./app";
import { env } from "./config/env";

const start = async () => {
  const port = env.port;

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${port}`);
  });
};

start();

