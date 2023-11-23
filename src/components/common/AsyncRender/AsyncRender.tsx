import * as React from "react";

import { createDisplayableError } from "~/utils";
import { ErrorPage, ErrorSection } from "./ErrorView";
import { DefaultPendingView } from "./PendingView";

import type { DisplayableError, RequestStatus } from "~/utils";
import type {
  AsyncRenderResult,
  AsyncErrorViewProps,
  AsyncRenderProps,
} from "./types";

// eslint-disable-next-line @typescript-eslint/ban-types
type Empty = {};

//================================================

const DefaultErrorView: React.FC<AsyncErrorViewProps> = ({ error }) => (
  <ErrorPage
    title={error?.status}
    message={error?.statusText || error?.title}
    instructions={error?.message}
  />
);

export const DefaultErrorSectionView: React.FC<AsyncErrorViewProps> = ({
  error,
}) => (
  <ErrorSection
    message={
      error?.status ? `${error?.statusText} (${error?.status})` : error?.title
    }
    instructions={error?.message}
  />
);

//================================================

/**
 * @template T,P
 * @typedef AsyncRenderChildren<T,P>
 * @type {(result: T, pending: boolean, passthroughProps: P) => React.Element | null}
 */

interface AsyncRenderState<T> {
  result?: AsyncRenderResult<T>;
  pending: boolean;
  success?: boolean;
  error?: DisplayableError;
}

type SetState<P, S> = <K extends keyof S>(
  state:
    | ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null)
    | (Pick<S, K> | S | null),
  callback?: () => void,
) => void;

type SetAsyncRenderState<T, P extends object> = SetState<
  AsyncRenderProps<T, P>,
  AsyncRenderState<T>
>;

export class AsyncRender<
  T,
  P extends object = Empty,
> extends React.PureComponent<AsyncRenderProps<T, P>, AsyncRenderState<T>> {
  constructor(props: AsyncRenderProps<T, P>) {
    super(props);
    this.state = {
      pending: true,
      result: props.initialValue,
    };
    this.status = {
      pending: true,
      success: false,
      error: undefined,
    };
  }
  mounted = false;
  status: RequestStatus;

  static defaultProps = {
    PendingView: DefaultPendingView,
    ErrorView: DefaultErrorView,
    resendOnFuncChange: true,
    showLoader: false,
    keepViewOnError: false,
  };

  setStateIfMounted: SetAsyncRenderState<T, P> = (...args) => {
    if (this.mounted) {
      this.setState(...args);
    }
  };

  componentDidMount() {
    this.mounted = true;
    this.tryRequest();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: AsyncRenderProps<T, P>) {
    if (
      prevProps.getPromise !== this.props.getPromise &&
      this.props.resendOnFuncChange
    ) {
      // if the request function changes, reset and resend the request
      this.setStateIfMounted(
        {
          pending: true,
          success: false,
          error: this.props.keepViewOnUpdate ? this.state.error : undefined,
          result: this.props.keepViewOnUpdate ? this.state.result : undefined,
        },
        this.tryRequest,
      );
    }
    if (
      this.props.initialValue !== prevProps.initialValue &&
      this.props.updateOnInitialValueChange
    ) {
      this.setStateIfMounted({
        result: this.props.initialValue,
      });
    }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setError(error);
    if (errorInfo) {
      console.error(`Additional info on error in AsyncRender:`, errorInfo);
    }
  }

  tryRequest = async () => {
    const { getPromise, onSuccess } = this.props;
    try {
      // send the request
      await getPromise()
        .then(result => {
          // if the request function has changed and it's going to be automatically
          // resent, do nothing
          if (
            this.props.getPromise !== getPromise &&
            this.props.resendOnFuncChange
          ) {
            return;
          }
          if (result?.error) {
            this.setError(result.error);
            return;
          }
          // otherwise store the result
          this.setStateIfMounted(
            {
              pending: false,
              success: true,
              result,
            },
            onSuccess ? () => onSuccess(result) : undefined,
          );
        })
        .catch(error => {
          if (
            this.props.getPromise !== getPromise &&
            this.props.resendOnFuncChange
          ) {
            return;
          }
          this.setError(error, `Promise rejected in AsyncRender component:`);
        });
    } catch (error) {
      this.setError(error);
    }
  };

  setError = (err: any, log = "Error occurred in AsyncRender component") => {
    const error = createDisplayableError(err, log);
    console.error(log, error);
    this.setStateIfMounted({
      pending: false,
      success: false,
      error,
      result: this.props.keepViewOnError ? this.state.result : undefined,
    });
  };

  getStatus = () => {
    const { pending, success = false, error } = this.state;
    if (
      this.status.pending !== pending ||
      this.status.success !== success ||
      this.status.error !== error
    ) {
      this.status = {
        pending,
        success,
        error,
      };
    }
    return this.status;
  };

  render() {
    const {
      View,
      ErrorView = DefaultErrorView,
      PendingView = DefaultPendingView,
      keepViewOnUpdate,
      passthroughProps,
      initialValue,
    } = this.props;
    const { pending, success, result, error } = this.state;

    const hasData = !!result?.data;
    try {
      // display the error view when the request resulted in an error AND
      // (
      //   there is no result OR the result is the initial result OR
      //   we don't want to keep the existing view while updating
      // )
      return !pending &&
        !success &&
        error &&
        (!hasData || result === initialValue || !keepViewOnUpdate) ? (
        <ErrorView error={error} />
      ) : // show the pending view when there is no result OR
      // the request is pending AND we don't want to keep the existing view while updating
      !hasData || (!keepViewOnUpdate && pending) ? (
        <PendingView />
      ) : // show the result view if the request was successful OR
      // there's a result AND we want to keep the view while updating
      success || (keepViewOnUpdate && hasData) ? (
        // @ts-expect-error: weird type resulting from generics
        <View status={this.getStatus()} result={result} {...passthroughProps} />
      ) : (
        <ErrorView error={error} />
      );
    } catch (otherError) {
      // @ts-expect-error: assume otherError inherits Error
      return <ErrorView error={createDisplayableError(otherError, "")} />;
    }
  }
}

//================================================
/*
/!**
 * HOC component that wraps a component with AsyncRender, with the option to
 * provide static props up front.
 *
 * Any props passed when the component is instantiated will override those props
 * passed to `withAsyncRender`.
 *!/
export const withAsyncRender = (<T, P extends object = Empty>(
  /!**
   * Props to "bind" to the AsyncRender component
   *
   * This can include `getPromise` and `passthroughProps`
   *!/
  asyncRenderProps = {}
) => {
  return (
    /!** Component to use as the View prop for AsyncRender *!/
    WrappedComponent: React.ComponentType<AsyncRenderViewProps<T, P>>,
    /!** The component's displayName, if it isn't already set *!/
    displayName = WrappedComponent.displayName
  ) => {
    const Component = forwardRef<
      AsyncRender<T, P>,
      Omit<AsyncRenderProps<T, P>, "View">
    >((props, ref) => {
      const {
        getPromise,
        ErrorView,
        PendingView,
        keepViewOnUpdate,
        initialValue,
        resendOnFuncChange,
        updateOnInitialValueChange,
        showLoader,
        keepViewOnError,
        onSuccess,
        passthroughProps,
        // @ts-expect-error: this shouldn't be passed, but we're destructuring it
        // just in case
        View,
        children,
        ...otherProps
      } = { ...asyncRenderProps, ...props };

      const passthrough: P = useMemo(
        () => ({
          ...passthroughProps,
          ...(otherProps as P),
        }),
        [otherProps, passthroughProps]
      );

      const ARProps = {
        getPromise,
        ErrorView,
        PendingView,
        keepViewOnUpdate,
        keepViewOnError,
        onSuccess,
        initialValue,
        resendOnFuncChange,
        updateOnInitialValueChange,
        showLoader,
      };

      return (
        <AsyncRender<T, P>
          {...ARProps}
          ref={ref}
          View={WrappedComponent}
          passthroughProps={passthrough}
        />
      );
    });
    WrappedComponent.displayName = displayName;
    Component.displayName = `withAsyncRender(${WrappedComponent.displayName})`;
    return Component;
  };
}) as WithAsyncRender;*/

// For whatever reason, importing from "components" in utils/hooks/asyncRender.js breaks the whole
// app, so we have to export the hook from here so we can declare the defaults for Error/PendingView
/**
 * hook substitute for AsyncRender class; useful for when the result/status is needed
 * outside of the result render view
 * @template T,P
 * @param {React.ComponentType<AsyncRenderViewProps<ApiResponse<T>,P>>} View
 * @param {RequestStatus} status
 * @param {T} [result]
 * @param {boolean} [keepViewOnUpdate]
 * @param {React.ComponentType<AsyncErrorViewProps>} [ErrorView]
 * @param {React.ComponentType} [PendingView]
 * @param {boolean} [allowEmptyResult]
 * @param {P} [passthroughProps]
 *
 * @returns {React.Element|null}
 */

/*

export const useAsyncRenderResult = (
  View,
  status,
  result,
  keepViewOnUpdate,
  ErrorView = DefaultErrorView,
  PendingView = DefaultPendingView,
  allowEmptyResult,
  passthroughProps
) =>
  useAsyncRenderResult__(
    View,
    status,
    result,
    keepViewOnUpdate,
    ErrorView,
    PendingView,
    allowEmptyResult,
    passthroughProps
  );

*/
