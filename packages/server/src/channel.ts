import { User } from "./state-server";

export type Channel = {
  key: string;
  createdAt: number;
  addUser(user: User): void;
  removeUser(user: User): void;
  setState(user: User, key: string, state: string): void;
  isEmpty(): boolean;
  serialize(): object;
};

const CHANNEL_STATE_KEY = "__CHANNEL";
const USER_STATE_KEY = "__USER";

export function createChannel(key: string): Channel {
  const states = new Map<string, string>();
  const users: User[] = [];

  function broadcast(key: string, state: string) {
    const message = JSON.stringify({ key, state });
    users.forEach(({ socket }) => {
      socket.send(message);
    });
  }

  function sendInfo() {
    const ids = users.map((user) => user.id);
    users.forEach((user) => {
      user.socket.send(
        JSON.stringify({
          key: CHANNEL_STATE_KEY,
          state: JSON.stringify({
            users: ids.filter((id) => user.id !== id),
          }),
        })
      );
    });
  }

  const userKeyPrefix = `${USER_STATE_KEY}:`;

  return {
    key,
    createdAt: Date.now(),

    setState(user, key, state) {
      if (key === CHANNEL_STATE_KEY || key.startsWith(userKeyPrefix)) return;

      if (key === USER_STATE_KEY) key = `${userKeyPrefix}${user.id}`;

      if (state === null) {
        states.delete(key);
        return;
      }

      broadcast(key, state);
      states.set(key, state);
    },

    addUser(user) {
      if (users.indexOf(user) !== -1) return;

      users.push(user);
      sendInfo();
      for (const [key, state] of states)
        user.socket.send(JSON.stringify({ key, state }));
    },

    removeUser(user) {
      const pos = users.indexOf(user);
      if (pos === -1) return;

      users.splice(pos, 1);
      sendInfo();
      states.delete(`${userKeyPrefix}${user.id}`);
    },

    isEmpty: () => users.length === 0,

    serialize() {
      const stateObject: any = {};
      Array.from(states.keys()).forEach((key) => {
        stateObject[key] = states.get(key);
      });
      return {
        connections: users.length,
        states: stateObject,
      };
    },
  };
}
