/** Datetime helpers */

export const getLatestDate = (arr: string[]): string => {
  let latest = arr[0];
  arr.map(d => {
    if (new Date(d) > new Date(latest)) {
      return (latest = d);
    }
    return d;
  });
  return latest;
};

export const getDaysApart = (
  date1: Date | string | number,
  date2: Date | string | number,
  abs = true,
): number => {
  const value =
    (new Date(date1).getTime() - new Date(date2).getTime()) /
    (1000 * 60 * 60 * 24);
  return abs ? Math.floor(Math.abs(value)) : value;
};

export const getDaysUntil = (date: Date | string | number): number =>
  Math.ceil(
    (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

export const getHoursApart = (
  date1: Date | string | number,
  date2: Date | string | number,
  abs = true,
): number => {
  const value =
    (new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 60 * 60);
  return abs ? Math.abs(value) : value;
};
