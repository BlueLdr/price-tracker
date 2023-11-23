import type { ThemeAdditions } from "~/theme";

declare module "@mui/material/styles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends ThemeAdditions {}
}
