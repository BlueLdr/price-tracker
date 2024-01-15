import { useContext } from "react";

import { DragModeContext } from "~/context";
import { classNames } from "~/utils";
import { DraggableItemContext, getDraggableHandleClassName } from "./utils";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DragHandle from "@mui/icons-material/DragHandle";

import type { BoxProps } from "@mui/material/Box";
import type { StyleProps } from "~/theme";

//================================================

const handleHiddenStyle: StyleProps = {
  display: "none",
};

const handleActiveStyle: StyleProps = {
  cursor: "grabbing",
};

const handleNormalStyle: StyleProps = {
  cursor: "grab",
};

//================================================

export type DraggableHandleProps<T extends React.ElementType = typeof Button> =
  BoxProps<T> & {
    showWhenDragDisabled?: true;
  };

export const DraggableHandle = <T extends React.ElementType = typeof Button>({
  showWhenDragDisabled,
  sx,
  component = Button,
  children = <DragHandle />,
  ...props
}: DraggableHandleProps<T>) => {
  const { dragEnabled, isDragging } = useContext(DragModeContext);
  const { level, isActive } = useContext(DraggableItemContext);

  const style: StyleProps = theme => ({
    ...(!!sx ? (typeof sx === "function" ? sx(theme) : sx ?? {}) : {}),
    ...(dragEnabled || showWhenDragDisabled
      ? handleNormalStyle
      : handleHiddenStyle),
    ...(isActive ? handleActiveStyle : {}),
  });

  return (
    <Box
      component={component}
      {...(component === Button
        ? {
            variant: "text",
            disableRipple: true,
            disabled: !dragEnabled || (isDragging && !isActive),
            minWidth: 0,
          }
        : {})}
      {...props}
      className={classNames(
        props.className,
        getDraggableHandleClassName(level),
      )}
      sx={style}
    >
      {children}
    </Box>
  );
};
