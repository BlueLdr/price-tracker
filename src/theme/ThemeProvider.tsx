"use client";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { useState } from "react";

import { MuiTheme } from "./Theme";

import GlobalStyles from "@mui/material/GlobalStyles";

import type { WithChildren } from "~/utils";

//================================================

const useGlobalStyles = (
  <GlobalStyles
    styles={{
      html: {
        height: "100%",
      },
      body: {
        margin: 0,
        height: "100%",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      "#root": {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      },
    }}
  />
);

//================================================

// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
export const ThemeProvider = ({ children }: WithChildren): React.ReactNode => {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "mui" });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={MuiTheme}>
        {useGlobalStyles}
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
};
