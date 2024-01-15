import { useCallback, useRef, useState } from "react";
import useSWR, { mutate } from "swr";

import type React from "react";

//================================================

export const useValueRef = <T>(value: T) => {
  const value_ref = useRef<T>(value);
  value_ref.current = value;
  return value_ref;
};

export interface StateObjectSetAction<T extends object> {
  (value: Partial<T>): void;
  (cb: (prevState: T) => T): void;
}
export const useStateObject = <T extends object>(initialState: T) => {
  const [state, setAllState] = useState(initialState);
  const setState = useCallback<StateObjectSetAction<T>>(newState => {
    if (typeof newState === "function") {
      return setAllState(newState);
    }
    setAllState(prevState => ({ ...prevState, ...newState }));
  }, []);
  return [state, setState] as const;
};

export const useLocalStorage = <T extends object | number | string>(
  key: string,
  initialValue: T,
): [T | undefined, React.Dispatch<React.SetStateAction<T>>] => {
  const initialized = useRef(false);

  const { data: value } = useSWR(key, () => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      } else {
        console.log(`No existing data found in localStorage`);
        return initialValue;
      }
    } catch (e) {
      console.error(`Failed to parse localStorage data:`, e);
      return initialValue;
    } finally {
      initialized.current = true;
    }
  });

  const valueRef = useValueRef<T>(value);
  const setValue = useCallback(
    (param: T | ((prev: T) => void)) => {
      let newValue: T;
      if (typeof param === "function") {
        newValue = param(valueRef.current);
      } else {
        newValue = param;
      }
      localStorage.setItem(key, JSON.stringify(newValue));
      mutate(key, newValue);
      valueRef.current = newValue;
    },
    [key, valueRef],
  );

  return [value, setValue];
};
