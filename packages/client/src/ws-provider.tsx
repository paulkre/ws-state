import React from "react";

const Context = React.createContext<WebSocket | null>(null);

export const useWebSocketContext = () => React.useContext(Context);

export const WebSocketProvider: React.FC<{ serverUrl: string }> = ({
  children,
  serverUrl,
}) => {
  const [tryCount, setTryCount] = React.useState(0);
  const [socket, setSocket] = React.useState<WebSocket | null>(null);

  React.useEffect((): void | (() => void) => {
    let mounted = true;

    function tryReconnecting() {
      setTimeout(() => {
        if (!mounted) return;
        setTryCount(tryCount + 1);
      }, 5000);
    }

    try {
      const ws = new WebSocket(serverUrl);
      setSocket(ws);

      ws.addEventListener("close", () => {
        if (!mounted) return;
        setSocket(null);
        tryReconnecting();
      });

      return () => {
        mounted = false;
        if (!ws.CLOSED) ws.close();
      };
    } catch {
      tryReconnecting();
    }
  }, [tryCount]);

  return <Context.Provider value={socket}>{children}</Context.Provider>;
};
