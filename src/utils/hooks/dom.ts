import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { ensureSuffix, useDebounce } from "~/utils";

//================================================

export interface MakeIdFunc<Base extends string = string> {
  id: Base;
  <S extends string>(suffix: S): `${Base}-${S}`;
  <S extends string>(suffix: S, _: null): MakeIdFunc<`${Base}-${S}`>;
}

const makeIdFunc = <P extends string>(prefix: P): MakeIdFunc<P> => {
  const func = (<S extends string>(suffix: S, _?: null) => {
    if (_ === null) {
      return makeIdFunc(`${prefix}-${suffix}`);
    }
    return `${prefix}-${suffix}`;
  }) as MakeIdFunc<P>;
  func.id = prefix;
  return func;
};

interface MakeIdHook {
  <P extends string>(prefix: P): MakeIdFunc<P>;
  <P extends string | undefined, F extends string>(
    prefix: P,
    fallbackPrefix: F,
  ): MakeIdFunc<P extends undefined | "" ? `${F}-${number}` : P>;
}

let idCounter = 0;
/**
 * Returns a callback to create an id string with the given prefix
 * @example
 *   const makeId = useUniqueId("table");
 *   // ...
 *   const makeRowId = makeId("row", null)
 *   // ...
 *   // suppose data.id === 1
 *   const rowId = makeRowId(data.id)
 *   // rowId === "table-row-1"
 * @param prefix Optional string to use as a prefix for the id string
 */
export const useUniqueId: MakeIdHook = ((prefix, fallbackPrefix) => {
  const base = useMemo(() => {
    if (!prefix) {
      console.warn(
        `useUniqueId: no prefix provided, using fallback with random number (${fallbackPrefix})`,
      );
    }
    return (
      prefix || `${fallbackPrefix ? `${fallbackPrefix}-` : ""}${idCounter++}`
    );
  }, [prefix, fallbackPrefix]);
  return useMemo(() => makeIdFunc(base), [base]);
}) as MakeIdHook;

export const useSuffix = (str: string | undefined, suffix: string): string => {
  return useMemo(() => {
    if (!str) {
      return "";
    }
    if (!suffix) {
      return str;
    }
    return ensureSuffix(str, suffix);
  }, [str, suffix]);
};

/**
 * Provides a flag and utility functions for opening and closing a modal (or
 * any component that uses the same behavior)
 * @param [initialOpen=false] If `true`, the modal will be open on initial render
 */
export const useModalToggle = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  return [open, openModal, closeModal] as const;
};

/**
 * Sets the open flag for a modal based on the presence of a target record.
 * Useful for controlling a modal that targets one of many records on the page.
 * NOTE: Make sure you pass TransitionProps to the modal.
 */
export const useModalTarget = <T>(target?: T) => {
  const [open, setOpen] = useState(!!target);
  const [storedTarget, setStoredTarget] = useState(target);

  // when target changes
  useEffect(() => {
    // if target exists, store it
    if (target) {
      setStoredTarget(target);
    }
    // open or close the modal
    setOpen(!!target);
  }, [target]);

  const TransitionProps = useMemo(() => {
    return !!storedTarget
      ? {
          // clear the stored target AFTER the modal close animation finishes
          // this prevents UI flashing after you trigger the modal close but
          // before the animation finishes
          onExited: () => setStoredTarget(undefined),
        }
      : undefined;
  }, [storedTarget]);

  return [open, storedTarget, TransitionProps] as const;
};

/**
 * Provides a mechanism to show a spinner only after the awaited task has been
 * in progress for a certain amount of time
 * @param [delay=500] The delay time (in ms) to use for the debounce
 */
export const useDelayedSpinner = (delay = 500) => {
  const [pending, setPending] = useState(false);
  const [showSpinner, setShowSpinner_] = useState(false);
  const setShowSpinner = useDebounce(setShowSpinner_, delay);

  useEffect(() => {
    // when pending becomes true, set the spinner to be visible (debounced)
    if (pending) {
      setShowSpinner(true);
      // if pending changes back to false before the debounced callback is
      // invoked, cancel the debounce
      return setShowSpinner.cancel;
    }
    setShowSpinner_(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return [pending, setPending, showSpinner] as const;
};

export const useMounted = () => {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
};
