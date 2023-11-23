import { capitalize } from "~/utils";

import type { PropsOfType, StringPropOf } from "~/utils";

//================================================

type ScoredMatch<T> = { item: T; score: number };

//================================================

/**
 * Generates a callback to pass to Array.sort
 * @param extract defines how to extract the value to use for comparison:
 *                the key of a property of the record type whose value is a string or number,
 *                OR a function that takes a record and returns a number
 * @param direction sort direction
 * @param fallback fallback comparison to use if the two records are "equal"
 */
export const comparator =
  <T extends object>(
    extract: PropsOfType<T, string | number> | ((item: T) => number),
    direction: "asc" | "desc" = "asc",
    fallback?: (a: T, b: T) => number,
  ) =>
  (a: T, b: T): number => {
    const vA = typeof extract === "function" ? extract(a) : a[extract];
    const vB = typeof extract === "function" ? extract(b) : b[extract];
    return (
      (direction === "asc" ? 1 : -1) *
      (vA < vB ? -1 : vA > vB ? 1 : fallback ? fallback(a, b) : 0)
    );
  };

// https://stackoverflow.com/a/6969486
export const escapeRegexStr = (str: string) =>
  str
    // eslint-disable-next-line no-useless-escape
    .replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
    .replace(/(\[.*)-(.*\])/g, "$1\\-$2");

export const filterItemsWithScore = <T>(
  text: string,
  items: readonly T[],
  testItem: (item: T, regex: RegExp) => boolean,
): ScoredMatch<T>[] => {
  if (!text) {
    return items.map(item => ({ item, score: 0 }));
  }
  //escape the text so it doesn't break the tester
  const escText = escapeRegexStr(text);

  const rA = new RegExp(escText, "i");
  // regexes to determine how closely the text matches each item
  // 0. Matches the text exactly
  const r0 = new RegExp(`^${escText}$`, "i");
  // 1. Matches the very beginning of the item
  const r1 = new RegExp(`^${escText}`, "i");
  // 2. Text is preceded by a separating character
  const r2 = new RegExp(`[- _.]${escText}`, "i");
  // 3. Text is preceeded by any lowercase letter or number,
  // and first char of text is capitalized
  const r3 = new RegExp(`[a-z0-9]${escapeRegexStr(capitalize(text))}`);
  // 4. Text is preceeded by any non-alphanumeric char
  const r4 = new RegExp(`[^A-Za-z0-9_]${escText}`, "i");

  const matches = items
    // filter out items that don't match at all
    .filter(item => testItem(item, rA))

    // get the score for each item
    .map((item: T) => {
      if (testItem(item, r0)) {
        return { score: 5, item };
      }
      if (testItem(item, r1)) {
        return { score: 4, item };
      }
      if (testItem(item, r2)) {
        return { score: 3, item };
      }
      if (testItem(item, r3)) {
        return { score: 2, item };
      }
      if (testItem(item, r4)) {
        return { score: 1, item };
      }
      return { score: 0, item };
    });

  // sort by score (descending) and return the result
  return matches.sort(comparator("score", "desc"));
};

export const filterItems = <T>(
  text: string,
  items: readonly T[],
  testItem: (item: T, regex: RegExp) => boolean,
): T[] => filterItemsWithScore(text, items, testItem).map(({ item }) => item);

export const filterItemsByProps = <T extends object>(
  text: string,
  items: T[],
  keys: StringPropOf<T>[],
): T[] => {
  if (!text) {
    return items;
  }
  const matches: { [K in StringPropOf<T>]?: ScoredMatch<T>[] } = {};
  keys.forEach(k => {
    matches[k] = filterItemsWithScore(text, items, (item, regex) =>
      regex.test(item[k]),
    );
  });

  let results: ScoredMatch<T>[] = [];
  keys.forEach(k => {
    if (matches[k]) {
      // @ts-expect-error: matches[k] still undefined???????
      results = results.concat(matches[k]);
    }
  });
  return results.sort(comparator("score", "desc")).map(({ item }) => item);
};
