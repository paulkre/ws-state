import React from "react";
import { useChannelContext } from "../channel-provider";

import { CHANNEL_INFO_KEY } from "../keys";

export function useChannelInfoState() {
  const { input } = useChannelContext();
  const [state, setState] = React.useState<{ users: string[] } | null>(null);

  React.useEffect(() => {
    if (!input) {
      setState(null);
      return;
    }

    input.addSetter(setState, CHANNEL_INFO_KEY);

    return () => {
      input.removeSetter(setState, CHANNEL_INFO_KEY);
    };
  }, [input]);

  return state;
}
