import { FormControlLabel } from "@mui/material";
import { useContext } from "react";

import { DragModeContext } from "~/context";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import Toolbar from "@mui/material/Toolbar";

//================================================

export const SiteHeader: React.FC = () => {
  const { dragEnabled, setDragEnabled } = useContext(DragModeContext);

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
