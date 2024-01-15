import { useContext } from "react";

import { DraggableItemContext } from "~/components";

import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { StyleProps } from "~/theme";
import type { ValueAndSetter, WithChildren } from "~/utils";
import type Paper from "@mui/material/Paper";
import type { AccordionProps } from "@mui/material/Accordion";

//================================================

type ComponentSize = "sm" | "md" | "lg";

//================================================

const summaryStyle = (size: ComponentSize): StyleProps => ({
  background: theme => theme.palette.grey[200],
  padding: theme =>
    theme.spacing(
      size === "sm" ? 2 : size === "md" ? 3 : 4,
      size === "sm" ? 4 : 6,
    ),
  minHeight: size !== "lg" ? 0 : undefined,
  maxHeight: theme =>
    theme.spacing(size === "sm" ? 8 : size === "md" ? 10 : 12),
  "&.Mui-expanded": {
    minHeight: theme =>
      theme.spacing(size === "sm" ? 8 : size === "md" ? 10 : 12),
    borderBottomLeftRadius: theme => theme.spacing(1),
  },
  "& .MuiAccordionSummary-content": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

const detailsStyle = (size: ComponentSize): StyleProps => ({
  padding: theme => (size === "lg" ? theme.spacing(4) : theme.spacing(2, 4)),
});

const actionsStyle = (size: ComponentSize): StyleProps => ({
  "& > *": {
    transition: "opacity 100ms ease",
    opacity: size !== "lg" ? 0 : 0.1,
    "&:hover, &:focus, &:focus-visible, &.Mui-focus, &.Mui-focusVisible": {
      opacity: 1,
    },
  },
  ".MuiAccordionSummary-root:hover & > *": {
    opacity: 0.5,
    "&:hover, &:focus, &:focus-visible, &.Mui-focus, &.Mui-focusVisible": {
      opacity: 1,
    },
  },
});

//================================================

export type DisclosureProps<
  Component extends React.ElementType = typeof Paper,
> = ValueAndSetter<"open", boolean> &
  Omit<
    AccordionProps<Component>,
    "expanded" | "defaultExpanded" | "onChange" | "children"
  > &
  WithChildren & {
    headerIcon?: React.ReactNode;
    header: React.ReactNode;
    actions?: React.ReactNode;
    closeWhenDragged?: boolean;
    size?: ComponentSize;
  };

export const Disclosure: React.FC<DisclosureProps> = ({
  header,
  headerIcon,
  children,
  open,
  setOpen,
  actions,
  closeWhenDragged,
  size = "lg",
  sx,
  ...props
}) => {
  const { isActive } = useContext(DraggableItemContext);
  const forceClose = isActive && closeWhenDragged;
  return (
    <Accordion
      variant="outlined"
      expanded={!forceClose && open}
      onChange={(_, newOpen) => (forceClose ? undefined : setOpen(newOpen))}
      sx={{ borderRadius: theme => theme.spacing(2), ...sx }}
      {...props}
    >
      <AccordionSummary sx={summaryStyle(size)}>
        <Box display="flex" alignItems="center">
          {headerIcon && <Box ml={-4}>{headerIcon}</Box>}
          <Typography
            sx={
              size === "sm"
                ? { fontSize: theme => theme.spacing(3.75) }
                : undefined
            }
          >
            {header}
          </Typography>
        </Box>
        {actions && (
          <AccordionActions
            sx={actionsStyle(size)}
            onClick={e => e.stopPropagation()}
          >
            {actions}
          </AccordionActions>
        )}
      </AccordionSummary>
      <AccordionDetails sx={detailsStyle(size)}>{children}</AccordionDetails>
    </Accordion>
  );
};
