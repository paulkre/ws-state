import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import {
  WebSocketProvider,
  ChannelProvider,
  useWebState,
  useChannelInfoState,
} from "@ws-state/client";

const NewChannelButton: React.FC = () => {
  const [name, setName] = React.useState("");
  const [state, setState] = useWebState<string[]>();

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();

        if (!name.length) return;
        const newState = state || [];
        if (newState.indexOf(name) !== -1) return;
        setState([...newState, name]);
        setName("");
      }}
    >
      <input
        type="text"
        placeholder="Create Channel"
        value={name}
        onChange={({ target: { value } }) => setName(value)}
      />
      <button type="submit">+</button>
    </form>
  );
};

const ChannelList: React.FC = () => {
  const [state] = useWebState<string[]>();

  return !state ? null : (
    <ul>
      {state.map((name, i) => (
        <li key={i}>
          <Link to={`/${encodeURI(name)}`}>{name}</Link>
        </li>
      ))}
    </ul>
  );
};

const ChannelContent: React.FC = () => {
  const state = useChannelInfoState();

  return !state ? null : <div>Connections: {state.users.length + 1}</div>;
};

const Channel: React.FC = () => {
  const { channelName } = useParams<{ channelName: string }>();

  return (
    <ChannelProvider channelKey={channelName}>
      <h2>{channelName}</h2>
      <ChannelContent />
    </ChannelProvider>
  );
};

export const App: React.FC = () => (
  <WebSocketProvider serverUrl="ws://localhost:3000">
    <Router>
      <div className="app">
        <h1>
          <Link to="/">ws-state</Link>
        </h1>
        <Switch>
          <Route path="/:channelName">
            <Channel />
          </Route>
          <Route path="/">
            <ChannelProvider>
              <NewChannelButton />
              <ChannelList />
            </ChannelProvider>
          </Route>
        </Switch>
      </div>
    </Router>
  </WebSocketProvider>
);
