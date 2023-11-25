import { createContext, useMemo } from "react";
import dynamic from "next/dynamic";

import { ScrapeScheduler, useLocalStorage } from "~/utils";

import type { WithChildren, ProductGroup } from "~/utils";

//================================================

const LOCAL_STORAGE_KEY = "price-checker-data";

export interface AppContext {
  groups: ProductGroup[] | undefined;
  setGroups: React.Dispatch<React.SetStateAction<ProductGroup[]>>;
  scrapeScheduler?: ScrapeScheduler;
}

export const AppContext = createContext<AppContext>({
  groups: undefined,
  setGroups: () => {},
  scrapeScheduler: undefined,
});

//================================================

const AppContextProviderComponent: React.FC<WithChildren> = ({ children }) => {
  const [groups, setGroups] = useLocalStorage<ProductGroup[]>(
    LOCAL_STORAGE_KEY,
    [],
  );

  const scrapeScheduler = useMemo(() => new ScrapeScheduler(), []);

  const value = useMemo(
    () => ({ groups, setGroups, scrapeScheduler }),
    [groups, setGroups, scrapeScheduler],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const AppContextProvider = dynamic(
  () => Promise.resolve(AppContextProviderComponent),
  { ssr: false },
);
