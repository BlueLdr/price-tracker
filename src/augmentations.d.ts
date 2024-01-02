import type { ThemeAdditions } from "~/theme";

declare module "@mui/material/styles" {
  interface Theme extends ThemeAdditions {}
}
