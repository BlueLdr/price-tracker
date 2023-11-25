import { AppView } from "~/components";
import { AppContextProvider, ModalsContextProvider } from "~/context";
import { ThemeProvider } from "~/theme";

import type { AppProps } from "next/app";

//================================================

const App = (props: AppProps): React.ReactNode => {
  const { Component, pageProps } = props;

  return (
    <ThemeProvider>
      <AppContextProvider>
        <AppView>
          <ModalsContextProvider>
            <Component {...pageProps} />
          </ModalsContextProvider>
        </AppView>
      </AppContextProvider>
    </ThemeProvider>
  );
};

export default App;
