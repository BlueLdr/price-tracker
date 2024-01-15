import { AppView } from "~/components";
import {
  AppContextProvider,
  DragModeContextProvider,
  ModalsContextProvider,
} from "~/context";
import { ThemeProvider } from "~/theme";

import type { AppProps } from "next/app";

//================================================

const App = (props: AppProps): React.ReactNode => {
  const { Component, pageProps } = props;

  return (
    <ThemeProvider>
      <AppContextProvider>
        <DragModeContextProvider>
          <AppView>
            <ModalsContextProvider>
              <Component {...pageProps} />
            </ModalsContextProvider>
          </AppView>
        </DragModeContextProvider>
      </AppContextProvider>
    </ThemeProvider>
  );
};

export default App;
