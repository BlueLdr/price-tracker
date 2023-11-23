import type { ApiResponse } from "~/api";
import type { DisplayableError, RequestStatus } from "~/utils";
import type { MaybeClassName } from "../types";

// eslint-disable-next-line @typescript-eslint/ban-types
type Empty = {}; /*

export type AsyncRenderResult<T> = T extends PagedApiResponse<any[]>
  ? T
  : T extends any[]
  ? ApiResponse<T> | PagedApiResponse<T>
  : ApiResponse<T>;*/

export type AsyncRenderResult<T> = ApiResponse<T>;

export type AsyncRenderViewProps<T, P extends object = Empty> = {
  /**
   * The value within the fulfilled promise that is returned by the `getPromise`
   * callback passed to AsyncRender
   */
  result: AsyncRenderResult<T>;
  /** The status of the request being handled by AsyncRender */
  status: RequestStatus;
} & Omit<P, "result" | "status">;

export interface AsyncErrorViewProps {
  /** The error that resulted from the request in AsyncRender */
  error?: DisplayableError;
}

export interface AsyncRenderProps<T, P extends object = Empty> {
  /** function that returns a promise with data of the expected type */
  getPromise: () => Promise<AsyncRenderResult<T>>;
  /** Component to display when the request is successful */
  View: React.ComponentType<AsyncRenderViewProps<T, P>>;
  /** Component to display when the request results in an error */
  ErrorView?: React.ComponentType<AsyncErrorViewProps>;
  /** Component to display while the request is pending */
  PendingView?: React.ComponentType;
  /** data to use for the result before the initial request is complete */
  initialValue?: AsyncRenderResult<T>;
  /** Keeps the View rendered when the request is resent (still shows the PendingView during the initial request) */
  keepViewOnUpdate?: boolean;
  /** Keeps the View rendered when the request is resent after being in an error state */
  keepViewOnError?: boolean;
  /** if true, the request will be resent every time the `getPromise` function changes */
  resendOnFuncChange?: boolean;
  /** if true, then when the initialValue changes, it will replace the current result in AsyncRender's state */
  updateOnInitialValueChange?: boolean;
  /** props to pass directly to the View */
  passthroughProps?: P;
  /** If the request succeeds, this callback will be invoked with the request result */
  onSuccess?: (result: AsyncRenderResult<T>) => void;
}

export interface ErrorPageText {
  /** The title text to display on the error page */
  title?: React.ReactNode;
  /** Specific details of the error that occurred */
  message?: React.ReactNode;
  /** Guidance for the user to try to mitigate the issue */
  instructions?: React.ReactNode;
  /** Text to display in the action button below the error details */
  buttonText?: React.ReactNode;
}
export interface ErrorPageProps extends ErrorPageText, MaybeClassName {
  /** default text to display */
  defaultText?: ErrorPageText;
  /** callback to invoke when clicking the button below the error details */
  onClickButton?: (e: any) => void;
  /** if `true`, the button below the error details is hidden */
  hideButton?: boolean;
}

/*

type WithAsyncRenderStaticProps<
  T,
  K extends keyof Omit<AsyncRenderProps<T>, "View">,
  P extends object = Empty
> = Pick<AsyncRenderProps<T>, K> & Omit<Partial<P>, K>;

type WithAsyncRenderWrapperProps<T, S> = Omit<
  AsyncRenderProps<T>,
  keyof S | "View"
> &
  Partial<S>;

export type WithAsyncRender = <
  T,
  K extends keyof Omit<AsyncRenderProps<T>, "View">,
  P extends object = Empty
>(
  asyncRenderProps?: WithAsyncRenderStaticProps<T, K, P>
) => ComponentWrapperFunc<
  AsyncRenderViewProps<T, P>,
  WithAsyncRenderWrapperProps<T, typeof asyncRenderProps>
>;
*/
