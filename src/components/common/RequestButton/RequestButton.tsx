/**
 * This was copied from the MUI Button source code and modified
 */

import * as React from "react";
import clsx from "clsx";
import { unstable_composeClasses as composeClasses } from "@mui/base/composeClasses";
import { useThemeProps, styled } from "@mui/material/styles";
import { alpha } from "@mui/system/colorManipulator";
import { shouldForwardProp } from "@mui/system/createStyled";
import {
  internal_resolveProps as resolveProps,
  unstable_capitalize as capitalize,
} from "@mui/utils";

import { classNameWithModifiers } from "~/utils";

import Box from "@mui/material/Box";
import { buttonClasses, getButtonUtilityClass } from "@mui/material/Button";
// eslint-disable-next-line import/no-internal-modules
import ButtonGroupContext from "@mui/material/ButtonGroup/ButtonGroupContext";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Grow from "@mui/material/Grow";
import Tooltip from "@mui/material/Tooltip";

import type { Theme } from "@mui/material/styles";
import type { ButtonProps, ExtendButton } from "@mui/material/Button";
import type { StyleProps } from "~/theme";
import type { RequestButtonProps, RequestButtonTypeMap } from "~/components";

//================================================

const useUtilityClasses = (ownerState: any) => {
  const { color, disableElevation, fullWidth, size, variant, classes } =
    ownerState;

  const slots = {
    root: [
      "root",
      variant,
      `${variant}${capitalize(color)}`,
      `size${capitalize(size)}`,
      `${variant}Size${capitalize(size)}`,
      color === "inherit" && "colorInherit",
      disableElevation && "disableElevation",
      fullWidth && "fullWidth",
    ],
    label: ["label"],
    startIcon: ["startIcon", `iconSize${capitalize(size)}`],
    endIcon: ["endIcon", `iconSize${capitalize(size)}`],
  };

  const composedClasses = composeClasses(slots, getButtonUtilityClass, classes);

  return {
    ...classes, // forward the focused, disabled, etc. classes to the ButtonBase
    ...composedClasses,
  };
};

const commonIconStyles = (ownerState: any) => ({
  ...(ownerState.size === "small" && {
    "& > *:nth-of-type(1)": {
      fontSize: 18,
    },
  }),
  ...(ownerState.size === "medium" && {
    "& > *:nth-of-type(1)": {
      fontSize: 20,
    },
  }),
  ...(ownerState.size === "large" && {
    "& > *:nth-of-type(1)": {
      fontSize: 22,
    },
  }),
});

const ButtonRoot = styled(ButtonBase, {
  shouldForwardProp: shouldForwardProp,
  name: "MuiButton",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      styles[`${ownerState.variant}${capitalize(ownerState.color)}`],
      styles[`size${capitalize(ownerState.size)}`],
      styles[`${ownerState.variant}Size${capitalize(ownerState.size)}`],
      ownerState.color === "inherit" && styles.colorInherit,
      ownerState.disableElevation && styles.disableElevation,
      ownerState.fullWidth && styles.fullWidth,
    ];
  },
})(
  ({
    theme,
    ownerState,
  }: {
    theme: Theme & { vars: any };
    ownerState: Required<ButtonProps>;
  }) => ({
    ...theme.typography.button,
    minWidth: 64,
    padding: "6px 16px",
    borderRadius: (theme.vars || theme).shape.borderRadius,
    transition: theme.transitions.create(
      ["background-color", "box-shadow", "border-color", "color"],
      {
        duration: theme.transitions.duration.short,
      },
    ),
    "&:hover": {
      textDecoration: "none",
      backgroundColor: theme.vars
        ? `rgba(${theme.vars.palette.text.primaryChannel} / ${theme.vars.palette.action.hoverOpacity})`
        : alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
      ...(ownerState.variant === "text" &&
        ownerState.color !== "inherit" && {
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette[ownerState.color].mainChannel} / ${
                theme.vars.palette.action.hoverOpacity
              })`
            : alpha(
                theme.palette[ownerState.color].main,
                theme.palette.action.hoverOpacity,
              ),
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: "transparent",
          },
        }),
      ...(ownerState.variant === "outlined" &&
        ownerState.color !== "inherit" && {
          border: `1px solid ${
            (theme.vars || theme).palette[ownerState.color].main
          }`,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette[ownerState.color].mainChannel} / ${
                theme.vars.palette.action.hoverOpacity
              })`
            : alpha(
                theme.palette[ownerState.color].main,
                theme.palette.action.hoverOpacity,
              ),
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: "transparent",
          },
        }),
      ...(ownerState.variant === "contained" && {
        backgroundColor: (theme.vars || theme).palette.grey.A100,
        boxShadow: (theme.vars || theme).shadows[4],
        // Reset on touch devices, it doesn't add specificity
        "@media (hover: none)": {
          boxShadow: (theme.vars || theme).shadows[2],
          backgroundColor: (theme.vars || theme).palette.grey[300],
        },
      }),
      ...(ownerState.variant === "contained" &&
        ownerState.color !== "inherit" && {
          backgroundColor: (theme.vars || theme).palette[ownerState.color].dark,
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: (theme.vars || theme).palette[ownerState.color]
              .main,
          },
        }),
    },
    "&:active": {
      ...(ownerState.variant === "contained" && {
        boxShadow: (theme.vars || theme).shadows[8],
      }),
    },
    [`&.${buttonClasses.focusVisible}`]: {
      ...(ownerState.variant === "contained" && {
        boxShadow: (theme.vars || theme).shadows[6],
      }),
    },
    [`&.${buttonClasses.disabled}`]: {
      color: (theme.vars || theme).palette.action.disabled,
      ...(ownerState.variant === "outlined" && {
        border: `1px solid ${
          (theme.vars || theme).palette.action.disabledBackground
        }`,
      }),
      ...(ownerState.variant === "contained" && {
        color: (theme.vars || theme).palette.action.disabled,
        boxShadow: (theme.vars || theme).shadows[0],
        backgroundColor: (theme.vars || theme).palette.action
          .disabledBackground,
      }),
    },
    ...(ownerState.variant === "text" && {
      padding: "6px 8px",
    }),
    ...(ownerState.variant === "text" &&
      ownerState.color !== "inherit" && {
        color: (theme.vars || theme).palette[ownerState.color].main,
      }),
    ...(ownerState.variant === "outlined" && {
      padding: "5px 15px",
      border: "1px solid currentColor",
    }),
    ...(ownerState.variant === "outlined" &&
      ownerState.color !== "inherit" && {
        color: (theme.vars || theme).palette[ownerState.color].main,
        border: theme.vars
          ? `1px solid rgba(${
              theme.vars.palette[ownerState.color].mainChannel
            } / 0.5)`
          : `1px solid ${alpha(theme.palette[ownerState.color].main, 0.5)}`,
      }),
    ...(ownerState.variant === "contained" && {
      color: theme.vars
        ? // this is safe because grey does not change between default light/dark mode
          theme.vars.palette.text.primary
        : theme.palette.getContrastText?.(theme.palette.grey[300]),
      backgroundColor: (theme.vars || theme).palette.grey[300],
      boxShadow: (theme.vars || theme).shadows[2],
    }),
    ...(ownerState.variant === "contained" &&
      ownerState.color !== "inherit" && {
        color: (theme.vars || theme).palette[ownerState.color].contrastText,
        backgroundColor: (theme.vars || theme).palette[ownerState.color].main,
      }),
    ...(ownerState.color === "inherit" && {
      color: "inherit",
      borderColor: "currentColor",
    }),
    ...(ownerState.size === "small" &&
      ownerState.variant === "text" && {
        padding: "4px 5px",
        fontSize: theme.typography.pxToRem(13),
      }),
    ...(ownerState.size === "large" &&
      ownerState.variant === "text" && {
        padding: "8px 11px",
        fontSize: theme.typography.pxToRem(15),
      }),
    ...(ownerState.size === "small" &&
      ownerState.variant === "outlined" && {
        padding: "3px 9px",
        fontSize: theme.typography.pxToRem(13),
      }),
    ...(ownerState.size === "large" &&
      ownerState.variant === "outlined" && {
        padding: "7px 21px",
        fontSize: theme.typography.pxToRem(15),
      }),
    ...(ownerState.size === "small" &&
      ownerState.variant === "contained" && {
        padding: "4px 10px",
        fontSize: theme.typography.pxToRem(13),
      }),
    ...(ownerState.size === "large" &&
      ownerState.variant === "contained" && {
        padding: "8px 22px",
        fontSize: theme.typography.pxToRem(15),
      }),
    ...(ownerState.fullWidth && {
      width: "100%",
    }),
    // @ts-expect-error: custom prop
    ...(ownerState.softDisabled && {
      pointerEvents: "none",
    }),
  }),
  ({ ownerState }) =>
    ownerState.disableElevation && {
      boxShadow: "none",
      "&:hover": {
        boxShadow: "none",
      },
      [`&.${buttonClasses.focusVisible}`]: {
        boxShadow: "none",
      },
      "&:active": {
        boxShadow: "none",
      },
      [`&.${buttonClasses.disabled}`]: {
        boxShadow: "none",
      },
    },
);

const ButtonStartIcon = styled("span", {
  name: "MuiButton",
  slot: "StartIcon",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.startIcon, styles[`iconSize${capitalize(ownerState.size)}`]];
  },
})(({ ownerState }: any) => ({
  display: "inherit",
  marginRight: 8,
  marginLeft: -4,
  ...(ownerState.size === "small" && {
    marginLeft: -2,
  }),
  ...commonIconStyles(ownerState),
}));

const ButtonEndIcon = styled("span", {
  name: "MuiButton",
  slot: "EndIcon",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.endIcon, styles[`iconSize${capitalize(ownerState.size)}`]];
  },
})(({ ownerState }: any) => ({
  display: "inherit",
  marginRight: -4,
  marginLeft: 8,
  ...(ownerState.size === "small" && {
    marginRight: -2,
  }),
  ...commonIconStyles(ownerState),
}));

const ButtonLabelContainer = styled(Box, {
  name: "MuiRequestButton",
  slot: "Label",
})(() => ({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "nowrap",
  position: "relative",
  boxSizing: "border-box",
}));
ButtonLabelContainer.displayName = "ButtonLabelContainer";

const ButtonLabel = styled("span")(({ ownerState }: any) => ({
  position: "absolute",
  width: "auto",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  flexWrap: "nowrap",
  ...(ownerState?.size
    ? {
        lineHeight: 0,
      }
    : {}),
}));
ButtonLabelContainer.displayName = "ButtonLabelContainer";

const spinnerStyles: StyleProps = {
  fontSize: "1rem",
  lineHeight: "1.5em",
};

export const RequestButton = React.forwardRef(function RequestButton<
  D extends React.ElementType,
>(inProps: RequestButtonProps<D>, ref: React.ForwardedRef<D>) {
  // props priority: `inProps` > `contextProps` > `themeDefaultProps`
  const contextProps = React.useContext(ButtonGroupContext);
  const resolvedProps = resolveProps<RequestButtonProps<D>>(
    // @ts-expect-error: no idea what this is about
    contextProps,
    inProps,
  );
  const props = useThemeProps({ props: resolvedProps, name: "MuiButton" });
  const {
    children,
    color = "primary",
    component = "button",
    className,
    disabled = false,
    disableElevation = false,
    disableFocusRipple = false,
    endIcon: endIconProp,
    focusVisibleClassName,
    fullWidth = false,
    size = "medium",
    startIcon: startIconProp,
    type,
    variant = "text",
    onClick,
    pending,
    success,
    error,
    successText,
    successStartIcon: successStartIconProp,
    successEndIcon: successEndIconProp,
    showErrorState,
    disableAfterSuccess,
    ...other
  } = props;

  const softDisabled = pending || (success && disableAfterSuccess);

  const ownerState = {
    ...props,
    color: error && showErrorState ? "error" : color,
    component,
    disabled,
    disableElevation,
    disableFocusRipple,
    fullWidth,
    size,
    type,
    variant,
    softDisabled,
  };

  const contentRef = React.useRef<HTMLSpanElement>(null);
  const successContentRef = React.useRef<HTMLSpanElement>(null);
  const pendingContentRef = React.useRef<HTMLSpanElement>(null);
  const [style, setStyle] = React.useState<{
    minWidth?: number;
    height?: number;
  }>({});
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (mounted) {
      setStyle({
        minWidth: Math.max(
          contentRef.current?.offsetWidth ?? 0,
          successContentRef.current?.offsetWidth ?? 0,
          pendingContentRef.current?.offsetWidth ?? 0,
        ),
        height: Math.max(
          contentRef.current?.offsetHeight ?? 0,
          successContentRef.current?.offsetHeight ?? 0,
          pendingContentRef.current?.offsetHeight ?? 0,
        ),
      });
    }
  }, [
    mounted,
    children,
    startIconProp,
    endIconProp,
    successText,
    successStartIconProp,
    successEndIconProp,
    contentRef.current?.offsetWidth,
    successContentRef.current?.offsetWidth,
    pendingContentRef.current?.offsetWidth,
  ]);

  const classes = useUtilityClasses(ownerState);

  const startIcon = startIconProp && (
    // @ts-expect-error: internal prop
    <ButtonStartIcon className={classes.startIcon} ownerState={ownerState}>
      {startIconProp}
    </ButtonStartIcon>
  );

  const endIcon = endIconProp && (
    // @ts-expect-error: internal prop
    <ButtonEndIcon className={classes.endIcon} ownerState={ownerState}>
      {endIconProp}
    </ButtonEndIcon>
  );

  const successStartIcon = successStartIconProp && (
    // @ts-expect-error: internal prop
    <ButtonStartIcon className={classes.startIcon} ownerState={ownerState}>
      {successStartIconProp}
    </ButtonStartIcon>
  );

  const successEndIcon = successEndIconProp && (
    // @ts-expect-error: internal prop
    <ButtonEndIcon className={classes.endIcon} ownerState={ownerState}>
      {successEndIconProp}
    </ButtonEndIcon>
  );

  const hasSuccessState = successText || successStartIcon || successEndIcon;

  const button = (
    // @ts-expect-error: types clobbered by forwardRef
    <ButtonRoot
      key="request-button"
      ownerState={ownerState}
      className={clsx(
        contextProps.className,
        classes.root,
        className,
        classNameWithModifiers("MuiRequestButton", {
          "-root": true,
          "-pending": pending,
          "-success": !!success && !!disableAfterSuccess,
          "-error": !!error && !!showErrorState,
        }),
      )}
      component={component}
      disabled={disabled}
      focusRipple={!disableFocusRipple}
      focusVisibleClassName={clsx(classes.focusVisible, focusVisibleClassName)}
      ref={ref}
      type={type}
      onClick={softDisabled ? undefined : onClick}
      {...other}
      classes={classes}
    >
      <ButtonLabelContainer
        className="MuiRequestButton-labelContainer"
        sx={style}
      >
        <Grow in={!pending && (!success || !hasSuccessState)}>
          <ButtonLabel ref={contentRef} className="MuiRequestButton-labelMain">
            {startIcon}
            {children}
            {endIcon}
          </ButtonLabel>
        </Grow>
        <Grow in={pending}>
          <ButtonLabel
            ref={pendingContentRef}
            className="MuiRequestButton-labelPending"
            // @ts-expect-error: internal prop
            ownerState={ownerState}
          >
            <CircularProgress
              sx={spinnerStyles}
              size={
                size === "small"
                  ? "1.25em"
                  : size === "large"
                  ? "1.75em"
                  : "1.5em"
              }
              thickness={
                size === "medium" ? 4 : size === "large" ? 4.5 : undefined
              }
              color="inherit"
              disableShrink
            />
          </ButtonLabel>
        </Grow>
        {hasSuccessState && !pending && (
          <Grow in={success}>
            <ButtonLabel
              ref={successContentRef}
              className="MuiRequestButton-labelSuccess"
            >
              {successStartIcon}
              {successText}
              {successEndIcon}
            </ButtonLabel>
          </Grow>
        )}
      </ButtonLabelContainer>
    </ButtonRoot>
  );

  return error && showErrorState && typeof error !== "boolean" ? (
    <Tooltip title={typeof error === "object" ? error.message : error}>
      {button}
    </Tooltip>
  ) : (
    button
  );
}) as ExtendButton<RequestButtonTypeMap>;
