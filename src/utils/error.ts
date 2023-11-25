const FALLBACK_MESSAGE = "An unknown error occurred.";

export class DisplayableError {
  constructor(
    error: Error | object | string,
    message: string,
    code?: string | number,
    title?: string,
    status?: number,
    statusText?: string,
  ) {
    this.raw = error;
    this.title = `${title ?? (error as any)?.title ?? ""}`;
    this.message = `${message || getErrorMessage(error, FALLBACK_MESSAGE)}`;
    this.code = code ?? (error as any)?.code;
    this.status = status ?? (error as any)?.status;
    this.statusText = statusText ?? (error as any)?.statusText;
  }

  raw: Error | object | string;
  message: string;
  code?: string | number;
  title?: string;
  status?: number;
  statusText?: string;
}

interface GetErrorMessage {
  (
    error: DisplayableError | Error | object | string,
    defaultMessage?: never,
  ): string | undefined;
  (
    error: DisplayableError | Error | object | string,
    defaultMessage: string,
  ): string;
}
export const getErrorMessage: GetErrorMessage = (error, defaultMessage) => {
  if (typeof error === "string") {
    return error;
  }
  const err: any = error;
  if (err?.title && err?.status) {
    return `${err.title} (${err.status})`;
  }
  if (typeof err?.message === "string") {
    return err.message;
  }
  return defaultMessage;
};

export const createDisplayableErrorFromAxiosError = async (
  error: DisplayableError | Error | /*AxiosError |*/ string | object,
  defaultMessage: string,
) => {
  if (error instanceof DisplayableError) {
    return error;
  }
  return createDisplayableError(error, defaultMessage);
  /*if (!(error as AxiosError)?.isAxiosError) {
    return createDisplayableError(error, defaultMessage);
  }

  return new DisplayableError(
    error,
    getErrorMessage(
      await parseAxiosError(error as AxiosError),
      defaultMessage
    ) as string,
    undefined,
    (error as any)?.message,
    (error as AxiosError)?.response?.status,
    (error as AxiosError)?.response?.statusText
  );*/
};

export const createDisplayableError = (
  error: DisplayableError | Error | string | object,
  defaultMessage: string,
): DisplayableError => {
  if (error instanceof DisplayableError) {
    return error;
  }
  const errorProp = (error as any).error;
  if (errorProp != null) {
    if (errorProp instanceof DisplayableError) {
      return errorProp;
    }
    error = errorProp;
  }
  const message = getErrorMessage(error, defaultMessage);
  return new DisplayableError(error, message);
};

export const isErrorResponse = (
  response: any,
): response is Error | DisplayableError | Record<"error", any> =>
  response instanceof Error ||
  response instanceof DisplayableError ||
  response?.error;
/*
export const parseAxiosError = async (error: AxiosError) => {
  const data = (error as AxiosError)?.response?.data;
  if (typeof data === "string") {
    return data;
  }
  if (!(data instanceof Blob)) {
    return;
  }
  const text = await data.text();
  try {
    return JSON.parse(text);
  } catch {
    if (text?.length < 512) {
      return data.text();
    }
  }
};*/
