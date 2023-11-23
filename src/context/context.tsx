import { createContext, useEffect, useMemo, useState } from "react";

import type { WithChildren, WithStateHook, ProductGroup } from "~/utils";

//================================================

const LOCAL_STORAGE_KEY = "price-checker-data";

let initialData: ProductGroup[] = [];
try {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    initialData = JSON.parse(stored);
  } else {
    console.log(`No existing data found in localStorage`);
  }
} catch (e) {
  console.error(`Failed to parse localStorage data:`, e);
}

export type AppContext = WithStateHook<"groups", ProductGroup[]>;

export const AppContext = createContext<AppContext>({
  groups: initialData,
  setGroups: () => {},
});

//================================================

export const AppContextProvider: React.FC<WithChildren> = ({ children }) => {
  const [groups, setGroups] = useState<ProductGroup[]>(initialData);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const value = useMemo(() => ({ groups, setGroups }), [groups]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
