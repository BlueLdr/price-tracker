import type { ExtendButtonTypeMap } from "@mui/material/Button";
import type { OverrideProps } from "@mui/material/OverridableComponent";
import type { DisplayableError } from "~/utils";

interface RequestButtonExtraProps {
  /** `true` if the request is in progress */
  pending: boolean;
  /** `true` if the request was successful */
  success?: boolean;
  /** `true` or the error, if the request resulted in an error */
  error?: boolean | string | DisplayableError;
  /**
   * Text to display in the button when `success` is `true`
   * If no value is provided, the button will display its regular `children`
   * */
  successText?: React.ReactNode;
  /** `startIcon` to display in the button when `success` is `true */
  successStartIcon?: React.ReactNode;
  /** `endIcon` to display in the button when `success` is `true */
  successEndIcon?: React.ReactNode;
  /**
   * If `true`, the button will be assigned different styles when `error`
   * has a truthy value.
   *
   * When `error` is a string or DisplayableError, the button will show the
   * error message in a tooltip on hover.
   */
  showErrorState?: boolean;
  /** If `true`, the button cannot be clicked when `success` is `true` */
  disableAfterSuccess?: boolean;
  /** `type` prop to pass to the HTML button element */
  type?: HTMLButtonElement["type"];
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Empty = {};

export type RequestButtonTypeMap<
  P = Empty,
  D extends React.ElementType = "button"
> = ExtendButtonTypeMap<{
  props: P & RequestButtonExtraProps;
  defaultComponent: D;
}>;

export type RequestButtonProps<
  D extends React.ElementType = RequestButtonTypeMap["defaultComponent"],
  P = Empty
> = OverrideProps<RequestButtonTypeMap<P, D>, D>;
