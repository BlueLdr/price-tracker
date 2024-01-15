import { AppView } from "~/components";
import {
  AppContextProvider,
  PreferencesContextProvider,
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
      <PreferencesContextProvider>
        <AppContextProvider>
          <DragModeContextProvider>
            <AppView>
              <ModalsContextProvider>
                <Component {...pageProps} />
              </ModalsContextProvider>
            </AppView>
          </DragModeContextProvider>
        </AppContextProvider>
      </PreferencesContextProvider>
    </ThemeProvider>
  );
};

export default App;
