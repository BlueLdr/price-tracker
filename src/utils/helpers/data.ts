// import deepmerge from "deepmerge";

import type {
  DeepStringDict,
  EntryOf,
  ParsedPageListing,
  ProductListing,
  PropsOfType,
} from "~/utils";

//================================================

/**
 * Get key/value pairs of a Typescript enum the same way you would from a normal
 * object with Object.entries()
 */
export const enumEntries = <T>(obj: T): EntryOf<typeof obj>[] =>
  (Object.entries(obj as any) as EntryOf<typeof obj>[]).filter(
    ent =>
      // @ts-expect-error: for numbers, this is valid
      typeof obj[ent[1]] !== "number",
  );
/** Object.keys, but for Typescript enum */
export const enumKeys = <T>(obj: T): (keyof typeof obj)[] =>
  enumEntries(obj).map(ent => ent[0]);
/** Object.values, but for Typescript enum */
export const enumValues = <T>(obj: T): (typeof obj)[keyof typeof obj][] =>
  enumEntries(obj).map(ent => ent[1]);

export const getEnumKeyByValue = <Enum, Value extends Enum[keyof Enum]>(
  enum_: Enum,
  value?: Value,
):
  | {
      [K in keyof Enum]: Value extends Enum[K] ? K : never;
    }[keyof Enum]
  | undefined =>
  typeof value === "number"
    ? (enum_[value as keyof typeof enum_] as keyof typeof enum_)
    : (enumEntries(enum_).find(([, val]) => val === value)?.[0] as any);

export const mapFromEnumValue = <
  Enum,
  Obj extends Partial<Record<keyof Enum, any>>,
>(
  enum_: Enum,
  value?: (typeof enum_)[keyof typeof enum_],
  obj?: Obj,
): Obj[keyof Obj] | undefined => {
  if (!obj || value === undefined) {
    return undefined;
  }
  const key = getEnumKeyByValue(enum_, value);
  if (key !== undefined && (key as any) in obj) {
    return obj?.[key as keyof typeof obj];
  }
};

export const toNumber = <D extends number | undefined = number | undefined>(
  value: any,
  def: D = undefined as D,
): number | D => {
  if (typeof value === "number") {
    return isNaN(value) ? def : value;
  }
  if (typeof value === "string") {
    const num = /\D/g.test(value) ? parseFloat(value) : parseInt(value);
    return isNaN(num) ? def : num;
  }
  return def;
};

export const roundUp = (num: number, multiple = 1) =>
  Math.ceil(num / multiple) * multiple;

export const createDeepStringDict = (
  keyPath: string,
  value: string,
): DeepStringDict =>
  keyPath
    .split(".")
    .reverse()
    .reduce(
      (obj, key, i) => ({ [key]: i === 0 ? value : obj }),
      {} as DeepStringDict,
    );

/*export const keyPathsToJson = (input: Record<string, string>): DeepStringDict =>
  Object.entries(input).reduce(
    (dict, [keyPath, value]) =>
      deepmerge(dict, createDeepStringDict(keyPath, value)),
    {} as DeepStringDict,
  );*/

export const groupBy = <T extends object, V extends string | number>(
  items: T[],
  key: PropsOfType<T, V | undefined | null>,
): Record<V, T[]> =>
  items.reduce(
    (acc, cur) => {
      if (cur[key] == null) {
        return acc;
      }
      const value = cur[key] as V;
      if (!acc[value]) {
        acc[value] = [cur];
      } else {
        acc[value].push(cur);
      }
      return acc;
    },
    {} as Record<V, T[]>,
  );

export const range = (start: number, stop: number, step = 1) => {
  return Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);
};

export const clamp = (min: number, max: number, n: number) =>
  Math.min(Math.max(n, min), max);

export const deepEquals = (
  a: any,
  b: any,
  maxDepth: number = 10,
  assumeDifferentAfterMaxDepth: boolean = false,
  depth: number = 0,
): boolean => {
  if (depth > maxDepth) {
    return assumeDifferentAfterMaxDepth;
  }
  if (a === b) {
    return true;
  }
  const ta = typeof a;
  const tb = typeof b;
  if (tb !== ta) {
    return false;
  }
  if (a === null || b === null) {
    return a === null && b === null;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length &&
      a.every((v, i) =>
        deepEquals(v, b[i], maxDepth, assumeDifferentAfterMaxDepth, depth + 1),
      )
    );
  }
  if (ta === "object") {
    const ea = Object.entries(a);
    const eb = Object.entries(b);
    return (
      ea.length === eb.length &&
      ea.every(
        ([k, v]) =>
          k in b &&
          deepEquals(
            v,
            b[k],
            maxDepth,
            assumeDifferentAfterMaxDepth,
            depth + 1,
          ),
      )
    );
  }
  return a === b;
};

// returns a tuple with:
// 1. the properties of B that are missing/different from A
// 2. an array of keys of A that are not present in B
export const getObjectDiff = <Schema extends object>(
  a: Partial<Schema>, // original data
  b: Partial<Schema>, // updated data
  maxDepth: number = 10,
  assumeDifferentAfterMaxDepth: boolean = false,
  depth: number = 0,
): [Partial<Schema> | undefined, (keyof Schema)[] | undefined] => {
  type K = keyof Schema;
  const deleted: K[] = [];
  const noDiff: [undefined, undefined] = [undefined, undefined];
  if (depth > maxDepth) {
    return assumeDifferentAfterMaxDepth ? [b, undefined] : noDiff;
  }
  if (a === b) {
    return noDiff;
  }
  const eb = Object.entries(b);
  const diffs: any[] = [];
  eb.forEach(([k, v]) => {
    if (!(k in a) && v !== undefined) {
      diffs.push([k, v]);
      return;
    }
    if (v === undefined && a[k as K] !== undefined) {
      deleted.push(k as K);
      return;
    }
    const propDiff = deepEquals(
      v,
      a[k as K],
      maxDepth,
      assumeDifferentAfterMaxDepth,
      depth + 1,
    )
      ? undefined
      : v;
    if (propDiff !== undefined) {
      diffs.push([k, propDiff]);
    }
  });
  if (diffs.length > 0) {
    const output: Partial<Schema> = {};
    diffs.forEach(([k, v]) => {
      output[k as K] = v;
    });
    return [output, deleted.length > 0 ? deleted : undefined];
  }
  if (deleted.length > 0) {
    return [undefined, deleted];
  }
  return noDiff;
};

export const getObjKeyByValue = <R, V>(
  obj: R,
  value: V,
):
  | {
      [K in keyof R]: V extends R[K] ? K : never;
    }[keyof R]
  // @ts-expect-error: type of key is `string` but we know it's a valid key
  | undefined => Object.entries(obj).find(([, val]) => val === value)?.[0];

export const getMinPriceListing = (
  listings: (ProductListing | ParsedPageListing)[],
) =>
  listings.reduce(
    (min, item) =>
      (min?.currentPrice ?? Infinity) > (item.currentPrice ?? Infinity)
        ? item
        : min,
    undefined as ParsedPageListing | ProductListing | undefined,
  );
