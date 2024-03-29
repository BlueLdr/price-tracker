import styled from "@emotion/styled";
import { useContext } from "react";

import { SiteHeader } from "~/components";
import { DragModeContext } from "~/context";
import {
  DRAGGED_ITEM_CONTAINER_ID,
  IFRAME_CONTAINER_ID,
} from "~/utils/constants";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";

import type { StyleProps } from "~/theme";

//================================================

const SiteContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
`;
SiteContainer.displayName = "styled(SiteContainer)";

const Body = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  box-sizing: border-box;
  & > .pending-view,
  & > * > .pending-view {
    min-height: ${({ theme }) => theme.spacing(120)};
  }
`;
Body.displayName = "Body";

const iframeContainerStyle: StyleProps = {
  visibility: "hidden",
  position: "fixed",
  top: "100%",
  left: "100%",
  zIndex: "-99999",
  width: "1px",
  height: "1px",
  overflow: "hidden",
};

const draggedItemContainerStyle: StyleProps = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vh",
  height: "100vh",
  zIndex: 9999,
  pointerEvents: "none",
  "&:empty": {
    display: "none",
  },
};

//================================================

export const AppView: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <>
    <CssBaseline />
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={
        useContext(DragModeContext).isDragging
          ? {
              cursor: "grabbing !important",
              overflowX: "hidden",
              overflowY: "visible",
            }
          : undefined
      }
    >
      <SiteContainer flexGrow={1}>
        <SiteHeader />
        <Body>{children}</Body>
      </SiteContainer>
      <Box id={IFRAME_CONTAINER_ID} sx={iframeContainerStyle} />
      <Box id={DRAGGED_ITEM_CONTAINER_ID} sx={draggedItemContainerStyle} />
    </Box>
  </>
);
