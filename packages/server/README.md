# @ws-state/server

The server component for ws-state.

## Usage

```typescript
import { createServer } from "http";
import { createWebSocketStateServer } from "@ws-state/server";

const server = createServer();
server.listen(3000);
createWebSocketStateServer(server);
```
