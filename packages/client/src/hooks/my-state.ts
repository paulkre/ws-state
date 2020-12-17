import React from "react";
import { useChannelContext } from "../channel-provider";

import { USER_KEY } from "../keys";

export function useMyWebState<S extends object>(
  initialState: S
): [S, (data: S) => void] {
  const { output } = useChannelContext();
  const [state, setInnerState] = React.useState<S>(initialState);

  const setState = React.useCallback(
    (data: S) => {
      if (!output) return;
      output.setState(data, USER_KEY);
      setInnerState(data);
    },
    [output]
  );

  React.useEffect(() => {
    if (!output) return;

    output.setState(state, USER_KEY);

    return () => {
      output.setState(null, USER_KEY);
    };
  }, [output]);

  return [state, setState];
}
