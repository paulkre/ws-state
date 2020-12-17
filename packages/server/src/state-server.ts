import WebSocket, { Server as WSS } from "ws";
import { Server } from "http";
import { v4 as createUUID } from "uuid";
import { createChannel, Channel } from "./channel";

const DEFAULT_KEY = "__DEFAULT";

const isDev = process.env.NODE_ENV === "development" || process.env.TS_NODE_DEV;

type Message<T = unknown> = {
  action?: string;
  data: T;
};

export type User = {
  id: string;
  socket: WebSocket;
};

export function createWebSocketStateServer(server: Server) {
  const wss = new WSS({ server });
  const channels = new Map<string, Channel>();

  wss.on("connection", (socket) => {
    const user: User = { id: createUUID(), socket };
    const userChannels: Channel[] = [];

    if (isDev) console.log(`> User[${user.id}] connected`);

    function subscribe(channelKey: string) {
      let channel = channels.get(channelKey);

      if (!channel) {
        channel = createChannel(channelKey);
        channels.set(channelKey, channel);
      }

      channel.addUser(user);
      userChannels.push(channel);
      if (isDev)
        console.log(`> User[${user.id}] joined Channel[${channelKey}]`);
    }

    function unsubscribe(channelKey: string) {
      const channel = channels.get(channelKey);
      if (!channel) return;

      channel.removeUser(user);
      if (isDev) console.log(`> User[${user.id}] left Channel[${channel.key}]`);

      userChannels.splice(userChannels.indexOf(channel), 1);
    }

    socket.on("message", (data) => {
      const message: Message = JSON.parse(data.toString());

      if (message.action === "SUBSCRIBE") {
        let {
          data: { channelKey },
        } = message as Message<{ channelKey?: string }>;

        subscribe(channelKey || DEFAULT_KEY);
      } else if (message.action === "UNSUBSCRIBE") {
        let {
          data: { channelKey },
        } = message as Message<{ channelKey?: string }>;

        unsubscribe(channelKey || DEFAULT_KEY);
      } else {
        let { state, stateKey, channelKey } = (message as Message<{
          state: string;
          channelKey?: string;
          stateKey?: string;
        }>).data;

        channels
          .get(channelKey || DEFAULT_KEY)
          ?.setState(user, stateKey || DEFAULT_KEY, state);
      }
    });

    socket.on("close", () => {
      userChannels.forEach((channel) => channel.removeUser(user));
      if (isDev) console.log(`> User[${user.id}] disconnected`);
    });
  });
}
