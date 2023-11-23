import deepmerge from "deepmerge";
import { useMemo, Children, isValidElement, forwardRef } from "react";

import { classNames } from "~/utils";

import Grid from "@mui/material/Grid";

import type { GridProps } from "@mui/material/Grid";
import type { StyleProps } from "~/theme";
import type { SpacedGridProps } from "~/components";

//================================================

const wrapGridChildren = (children: React.ReactNode) =>
  Children.map(children, child => {
    if (!isValidElement(child)) {
      return child;
    }
    return (
      <Grid key={child?.key} item>
        {child}
      </Grid>
    );
  });

//================================================

const disableXSpacingStyle: StyleProps = {
  marginLeft: 0,
  marginRight: 0,
  "& > .MuiGrid-item": {
    paddingLeft: 0,
    paddingRight: 0,
  },
};

const disableYSpacingStyle: StyleProps = {
  marginTop: 0,
  marginBottom: 0,
  "& > .MuiGrid-item": {
    paddingTop: 0,
    paddingBottom: 0,
  },
};

//================================================

/**
 * Wraps each of its children in a <Grid item> element, and renders them inside
 * a <Grid container> element. All props are passed to the <Grid container>
 */
const SpacedGrid: React.ForwardRefRenderFunction<HTMLDivElement, SpacedGridProps> = (
  ({ children, disableOrthogonalSpacing, ...props }: SpacedGridProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const gridChildren = useMemo(() => wrapGridChildren(children), [children]);
    return (
      <Grid
        ref={ref}
        {...props}
        sx={
          disableOrthogonalSpacing
            ? deepmerge<StyleProps>(
                props.direction === "column" ||
                  props.direction === "column-reverse"
                  ? disableXSpacingStyle
                  : disableYSpacingStyle,
                props.sx ?? {}
              )
            : props.sx
        }
        className={classNames("MuiGrid-spaced", props.className)}
        container={true}
      >
        {gridChildren}
      </Grid>
    );
  }
) as (<C extends React.ElementType>(
    props: GridProps<C, { component?: C }>
  ) => React.ReactElement | null);
SpacedGrid.displayName = "SpacedGrid";

export default forwardRef(SpacedGrid)
