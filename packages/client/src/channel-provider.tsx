import React from "react";
import { useWebSocketContext } from "./ws-provider";

import { DEFAULT_KEY } from "./keys";

type InputManager = {
  addSetter(setState: React.SetStateAction<{}>, key?: string): void;
  removeSetter(setState: React.SetStateAction<{}>, key?: string): void;
};

type OutputManager = {
  setState(state: {} | null, key?: string): void;
};

type ContextValue = {
  input: InputManager | null;
  output: OutputManager | null;
};

const initialContextValue: ContextValue = { input: null, output: null };
const Context = React.createContext<ContextValue>(initialContextValue);

export const useChannelContext = () => React.useContext(Context);

export const ChannelProvider: React.FC<{
  channelKey?: string;
}> = ({ children, channelKey }) => {
  const socket = useWebSocketContext();
  const [channel, setChannel] = React.useState<ContextValue>(
    initialContextValue
  );

  React.useEffect(() => {
    if (!socket) return;
    let active = true;

    const stateListeners: {
      [id: string]: React.SetStateAction<any>[] | undefined;
    } = {};

    const input: InputManager = {
      addSetter(setState, key = DEFAULT_KEY) {
        if (!stateListeners[key]) stateListeners[key] = [];
        stateListeners[key]!.push(setState);
      },
      removeSetter(setState, key = DEFAULT_KEY) {
        const setters = stateListeners[key]!;
        setters.splice(setters.indexOf(setState), 1);
      },
    };

    setChannel({
      input,
      output: null,
    });

    function init() {
      if (!active) return;

      socket!.send(
        JSON.stringify({ action: "SUBSCRIBE", data: { channelKey } })
      );

      setChannel({
        input,
        output: {
          setState(state, stateKey) {
            socket!.send(
              JSON.stringify({
                data: {
                  channelKey,
                  stateKey,
                  state: state && JSON.stringify(state),
                },
              })
            );
          },
        },
      });
    }

    function handleMessage({ data }: any) {
      const { state, key } = JSON.parse(data) as { state: string; key: string };
      const setters = stateListeners[key || DEFAULT_KEY];
      if (!setters || !setters.length) return;

      const parsedState = JSON.parse(state);
      setters.forEach((setState) => {
        setState(parsedState);
      });
    }

    function handleClose() {
      active = false;
      setChannel(initialContextValue);
    }

    if (socket.readyState === WebSocket.OPEN) init();
    else socket.addEventListener("open", init);
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("close", handleClose);

    return () => {
      active = false;
      socket.send(
        JSON.stringify({ action: "UNSUBSCRIBE", data: { channelKey } })
      );
      socket.removeEventListener("open", init);
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("close", handleClose);
    };
  }, [socket, channelKey]);

  return <Context.Provider value={channel}>{children}</Context.Provider>;
};
