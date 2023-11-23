import styled from "@emotion/styled";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";

import type { GridProps } from "@mui/material/Grid";

//================================================

const SpinnerContainer = styled(Grid)`
  width: 100%;
  height: 100%;
`;
SpinnerContainer.displayName = "styled(SpinnerContainer)";

//================================================

export const LoadingSpinner = (props: GridProps<typeof Box>) => (
  <Grid
    container
    component={Box}
    padding={8}
    justifyContent="center"
    alignItems="center"
    {...props}
  >
    <CircularProgress />
  </Grid>
);

export const DefaultPendingView = () => (
  <SpinnerContainer
    className="pending-view"
    container
    justifyContent="center"
    alignItems="center"
  >
    <LoadingSpinner />
  </SpinnerContainer>
);
