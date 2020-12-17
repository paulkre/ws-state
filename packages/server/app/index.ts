import { createWebSocketStateServer } from "../src";
import { createServer } from "http";

const port = process.env.PORT || 3000;

const server = createServer();
server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`);
});

createWebSocketStateServer(server);
