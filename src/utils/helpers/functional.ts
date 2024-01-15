import type { ApiResponse } from "~/api";

export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): DebouncedFunc<T> => {
  let timer: any = null;
  const invoke: DebouncedFunc<T> = (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(...args);
      timer = null;
    }, delay);
  };
  invoke.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  return invoke;
};

/**
 * Takes a dictionary of promises and returns an ApiResponse whose `data` is
 * a dictionary with the same keys as the input and the response data for the
 * respective request as the values.
 *
 * If ANY of the input promises is rejected, the entire function will reject with
 * the error from the failed request
 * @param promises Dictionary of in-flight promises; NOTE: these must be the
 *                 promises themselves, not functions that return promises
 */
export const promiseAll = async <T>(promises: {
  [K in keyof T]: Promise<ApiResponse<T[K]>>;
}): Promise<ApiResponse<T>> => {
  const keys = Object.keys(promises) as (keyof T)[];
  const promiseResults = await Promise.allSettled(Object.values(promises));
  for (const res of promiseResults) {
    if (res.status === "rejected") {
      return Promise.reject(res.reason);
    }
    if ((res.value as ApiResponse<any>).error) {
      return Promise.reject((res.value as ApiResponse<any>).error);
    }
  }
  return {
    data: keys.reduce(<K extends keyof T>(obj: T, key: K, i: number) => {
      obj[key] = (
        promiseResults[i] as PromiseFulfilledResult<ApiResponse<T[K]>>
      ).value.data!;
      return obj;
    }, {} as T),
    error: undefined,
    rawResponse: {} as any,
  };
};

// resolve promise after timeout finishes
export const awaitTimeout = <T>(
  callback: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
  ) => Promise<any>,
  timeout: number,
) =>
  new Promise<T>((resolve, reject) => {
    setTimeout(() => callback(resolve, reject), timeout);
  });

export type ArrayInsertPosSpecifier<T> =
  | "start"
  | "end"
  | number
  | ((a: T, b: T) => -1 | 0 | 1);

// helper functions to manipulate arrays without mutating the original copy
export const addItemTo = <T>(
  list: readonly T[],
  item: T,
  pos: ArrayInsertPosSpecifier<T> = "end",
): T[] => {
  if (!item) {
    return list ? list.slice() : [];
  }
  if (!list) {
    list = [];
  }
  if (list.length === 0) {
    return [item];
  }
  if (typeof pos === "number") {
    return [...list.slice(0, pos), item, ...list.slice(pos)];
  }
  if (typeof pos === "function") {
    let index = -1;
    let i = 0;
    while (i < list.length && index < 0) {
      const comp = pos(item, list[i]);
      if (comp === 1) {
        i++;
      } else {
        index = i;
      }
    }
    if (index !== 0 && index !== list.length - 1) {
      return [...list.slice(0, index), item, ...list.slice(index)];
    }

    pos = index === 0 ? "start" : "end";
  }
  return pos === "start" ? [item as T].concat(list) : list.concat([item]);
};

export const removeItemFrom = <T>(
  list: readonly T[],
  match: (item: T, index?: number) => boolean,
): T[] => {
  const index = list.findIndex(match);
  if (index === -1) return list.slice();
  return list.slice(0, index).concat(list.slice(index + 1));
};

export const replaceItemIn = <T extends object | number | string>(
  list: readonly T[],
  match: (item: T, index?: number) => boolean,
  newItem: T | ((prevState?: T) => T),
  appendIfMissing?: ArrayInsertPosSpecifier<T>,
): T[] => {
  const index = list.findIndex(match);
  const newItem_ =
    typeof newItem === "function" ? newItem(list[index]) : newItem;
  if (index === -1) {
    return appendIfMissing
      ? addItemTo(list, newItem_, appendIfMissing)
      : list.slice();
  }
  return list
    .slice(0, index)
    .concat([newItem_])
    .concat(list.slice(index + 1));
};

export const projectFromList = <T extends object, C extends keyof T>(
  list: T[],
  query: Partial<T>,
  project?: C | C[],
): T[C] | Partial<T> | null => {
  // find the item in the list that matches the query
  const index = list.findIndex(
    item =>
      Object.entries(query).filter(([key, value]) => item[key as C] !== value)
        .length === 0,
  );
  if (index === -1) return null;

  // if a projection is specified, pick those props, otherwise return the whole object
  return (
    !project
      ? list[index]
      : Array.isArray(project)
      ? pick(project, list[index])
      : list[index][project]
  ) as any;
};

export const unionArrays = <T>(
  arr1: T[],
  arr2: T[],
  isEqual?: keyof T | ((a: T, b: T) => boolean),
) => {
  if (arr1.length === 0) {
    return arr2;
  }
  if (arr2.length === 0) {
    return arr1;
  }
  return arr1.concat(
    arr2.filter(b => {
      if (isEqual != null) {
        if (typeof isEqual === "function") {
          return !arr1.some(a => isEqual(b, a));
        }
        return !arr1.some(a => a[isEqual] === b[isEqual]);
      }
      return !arr1.includes(b);
    }),
  );
};

export const pick = <T extends object, K extends keyof T>(
  keys: K[],
  obj: T,
): { [Key in K]: T[K] } => {
  const ret: any = {};
  keys.forEach(k => {
    if (k in obj) {
      ret[k] = obj[k as keyof T];
    }
  });
  return ret;
};

/** copied from mindgrub library */
export const pathOr = (def: any, path: Array<string | number>, obj: object) => {
  let ret: any = obj;
  for (const key of path) {
    if (ret == null) return def;
    ret = ret[key];
  }
  return ret == null ? def : ret;
};
