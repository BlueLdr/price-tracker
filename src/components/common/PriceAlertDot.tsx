import { useContext, useState } from "react";

import { DragModeContext } from "~/context";
import { AlertDot } from "~/components";

import Box from "@mui/material/Box";

import type { Product, ProductListing } from "~/utils";
import type { AlertDotProps } from "~/components";
import type { BoxProps } from "@mui/material/Box";

//================================================

export interface PriceAlertDotProps
  extends Partial<AlertDotProps>,
    Omit<BoxProps, keyof AlertDotProps> {
  data: Product | ProductListing;
}

export const PriceAlertDot: React.FC<PriceAlertDotProps> = ({
  data,
  size,
  intensity,
  color,
  className,
  ...props
}) => {
  const { dragEnabled } = useContext(DragModeContext);
  const acknowledged = data.currentPrice?.acknowledged;
  const [hidden, setHidden] = useState(data.currentPrice?.acknowledged);

  if (
    dragEnabled ||
    (acknowledged && hidden) ||
    (data.currentPrice?.price != null &&
      !data.priceDropped &&
      !data.priceIsNewLow &&
      !data.priceIncreased)
  ) {
    return null;
  }
  if (data.priceIsNewLow) {
    size = size || "lg";
    intensity = intensity || 3;
    color = color || "success";
  } else if (data.priceDropped) {
    size = "md";
    intensity = data.priceIsLowest ? 2 : 1;
    color = "success";
  } else if (data.priceIncreased) {
    size = "sm";
    intensity = 1;
    color = "error";
  } else if (data.currentPrice?.price == null) {
    size = "md";
    intensity = 1;
    color = "warning";
  }

  return (
    <Box
      display="inline-flex"
      justifyContent="center"
      alignItems="center"
      component="span"
      {...props}
      sx={{
        ...props.sx,
        cursor: !acknowledged && !hidden ? "pointer" : undefined,
        transition: theme =>
          theme.transitions.create(["transform", "opacity"], {
            duration: 150,
            easing: "cubic-bezier(1,0,.78,.82)",
          }),
        opacity: acknowledged || hidden ? 0 : 1,
        transform: `scale(${acknowledged || hidden ? 0 : 1})`,
      }}
      onTransitionEnd={() => setHidden(true)}
    >
      <AlertDot
        size={size}
        intensity={intensity ?? 2}
        color={color}
        className={className}
      />
    </Box>
  );
};
