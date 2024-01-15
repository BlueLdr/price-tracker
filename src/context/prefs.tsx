import dynamic from "next/dynamic";
import React, { useMemo, createContext } from "react";

import { useLocalStorage } from "~/utils";

import type { WithChildren } from "~/utils";

//================================================

export interface AppPreferences {
  compactView: boolean;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  compactView: false,
};

export interface AppPreferencesContext {
  prefs: AppPreferences | undefined;
  setPrefs: React.Dispatch<React.SetStateAction<AppPreferences>>;
}

export const PrefsContext = createContext<AppPreferencesContext>({
  prefs: DEFAULT_PREFERENCES,
  setPrefs: () => {},
});

const LOCAL_STORAGE_KEY = "price-checker-preferences";

//================================================

export const PreferencesContextProviderComponent: React.FC<WithChildren> = ({
  children,
}) => {
  const [prefs, setPrefs] = useLocalStorage<AppPreferences>(
    LOCAL_STORAGE_KEY,
    DEFAULT_PREFERENCES,
  );

  const value = useMemo(() => ({ prefs, setPrefs }), [prefs, setPrefs]);

  return (
    <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
  );
};

export const PreferencesContextProvider = dynamic(
  () => Promise.resolve(PreferencesContextProviderComponent),
  { ssr: false },
);
