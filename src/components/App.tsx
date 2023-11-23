import { AppView, Main } from "~/components";
import { ModalsContextProvider } from "~/context";

//================================================

export const App: React.FC = () => {
  return (
    <AppView>
      <ModalsContextProvider>
        <Main />
      </ModalsContextProvider>
    </AppView>
  );
};
