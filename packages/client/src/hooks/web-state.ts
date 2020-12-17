import React from "react";
import { useChannelContext } from "../channel-provider";

export function useWebState<S extends object>(
  key?: string
): [S | null, (data: Partial<S>) => void] {
  const { input, output } = useChannelContext();
  const [state, setInnerState] = React.useState<S | null>(null);

  const setState = React.useCallback(
    (data: Partial<S>) => {
      if (!output) return;
      output.setState(data, key);
    },
    [output, key]
  );

  React.useEffect(() => {
    if (!input) {
      setInnerState(null);
      return;
    }

    input.addSetter(setInnerState, key);

    return () => {
      input.removeSetter(setInnerState, key);
    };
  }, [input, key]);

  return [state, setState];
}
