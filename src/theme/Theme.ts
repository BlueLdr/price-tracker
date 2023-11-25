import {
  createTheme,
  unstable_createMuiStrictModeTheme,
} from "@mui/material/styles";

// import * as overrides from "./overrides";

import ExpandMore from "@mui/icons-material/ExpandMore";

import type { ThemeOptions } from "@mui/material/styles";

//================================================

/*
  https://github.com/mui-org/material-ui/issues/13394
  https://v4.mui.com/customization/theming/#unstable-createmuistrictmodetheme-options-args-theme
*/
const createMuiThemeForEnvironment =
  process.env.NODE_ENV === "production"
    ? createTheme
    : unstable_createMuiStrictModeTheme;

const themeCustomization: ThemeOptions = {
  spacing: 4,
  palette: {
    common: {},
    grey: {
      50: "rgba(248, 248, 248, 1)",
      100: "rgba(242, 242, 242, 1)",
      200: "rgba(224, 224, 224, 1)",
      300: "rgba(214, 214, 214, 1)",
      400: "rgba(204, 204, 204, 1)",
      500: "rgba(183, 183, 183, 1)",
      600: "rgba(153, 153, 153, 1)",
      700: "rgba(102, 102, 102, 1)",
      800: "rgba(51, 51, 51, 1)",
      900: "rgba(35, 35, 35, 1)",
    },
    text: {
      primary: "rgba(52, 58, 64, 1)",
      secondary: "rgba(108, 117, 125, 1)",
      disabled: "rgba(134, 142, 150, 1)",
    },
  },
  typography: {
    htmlFontSize: 16,
    button: {
      fontWeight: 400,
      textTransform: "none",
    },
  },
  components: {
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: ExpandMore,
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: "small",
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiList: {
      defaultProps: {
        disablePadding: true,
      },
    },
    MuiListItem: {
      defaultProps: {
        disableGutters: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        PaperProps: {
          variant: "elevation",
          elevation: 8,
        },
        keepMounted: true,
      },
    },
    MuiMenuItem: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
};

/*
type Override = Exclude<EntryOf<ComponentsOverrides<Theme>>, undefined>;
(Object.entries(overrides) as Override[]).forEach(([key, styles]) => {
  if (!themeCustomization.components) {
    themeCustomization.components = {};
  }
  if (!themeCustomization.components[key]) {
    themeCustomization.components[key] = {};
  }
  themeCustomization.components[key]!.styleOverrides = styles;
});
*/

export const MuiTheme = createMuiThemeForEnvironment(themeCustomization);
