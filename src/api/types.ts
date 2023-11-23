import type { DisplayableError } from "~/utils";

export interface ApiErrorResponse {
  data?: null;
  error: DisplayableError;
  rawResponse: any; // AxiosResponse | AxiosError | null;
  meta?: undefined;
}
export interface ApiSuccessResponse<R> {
  data: R;
  error?: null;
  rawResponse: any; // AxiosResponse<R> | null;
  meta?: ApiResponseMeta;
}

export interface ApiResponseMeta {
  /*total: number;
  page: number;
  rowsPerPage: number;
  pageCount: number;*/
  search?: URLSearchParams;
}

export type ApiResponse<R> = ApiSuccessResponse<R> | ApiErrorResponse;
