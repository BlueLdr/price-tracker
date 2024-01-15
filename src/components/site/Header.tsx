import { useContext } from "react";

import { DragModeContext, PrefsContext } from "~/context";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Toolbar from "@mui/material/Toolbar";
import ListIcon from "@mui/icons-material/List";
import ViewListIcon from "@mui/icons-material/ViewList";
import Tooltip from "@mui/material/Tooltip";

import type { StyleProps } from "~/theme";

//================================================

const toggleButtonStyle: StyleProps = {
  padding: 0,
  "& .MuiSvgIcon-root": {
    boxSizing: "content-box",
    padding: theme => theme.spacing(2),
  },
};

//================================================

export const SiteHeader: React.FC = () => {
  const { dragEnabled, setDragEnabled } = useContext(DragModeContext);
  const { prefs, setPrefs } = useContext(PrefsContext);

  return (
    <AppBar
      id="site-header"
      elevation={0}
      position="relative"
      color="transparent"
    >
      <Toolbar component={Box} mx="auto" width="100%" maxWidth={1080}>
        {
          // @ts-expect-error: `edge` prop handled by <Toolbar>
          <Grid edge="start" />
        }
        {
          // @ts-expect-error: `edge` prop handled by <Toolbar>
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="flex-end"
            edge="end"
          >
            <Grid item>
              <ToggleButtonGroup
                value={prefs?.compactView ?? false}
                exclusive
                onChange={(_, value) =>
                  value != null &&
                  setPrefs(curValue => ({
                    ...curValue,
                    compactView: Boolean(value),
                  }))
                }
              >
                <ToggleButton value={false} sx={toggleButtonStyle}>
                  <Tooltip title="Normal View">
                    <ViewListIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value={true} sx={toggleButtonStyle}>
                  <Tooltip title="Compact View">
                    <ListIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={dragEnabled}
                    onChange={(_, checked) => setDragEnabled(checked)}
                  />
                }
                label="Rearrange"
              />
            </Grid>
          </Grid>
        }
      </Toolbar>
    </AppBar>
  );
};
