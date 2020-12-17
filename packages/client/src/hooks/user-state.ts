import React from "react";
import { useChannelContext } from "../channel-provider";

import { USER_KEY } from "../keys";

export function useUserWebState<S extends object = {}>(uuid: string): S | null {
  const { input } = useChannelContext();
  const [state, setState] = React.useState<S | null>(null);

  React.useEffect(() => {
    if (!input) return;

    const key = `${USER_KEY}:${uuid}`;

    input.addSetter(setState, key);

    return () => {
      input.removeSetter(setState, key);
    };
  }, [input, uuid]);

  return state;
}
