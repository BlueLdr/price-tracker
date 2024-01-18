import type { ProductListingHistoryEntry } from "~/utils";

export const capitalize = (str: string): string =>
  str[0].toUpperCase().concat(str.slice(1));

export const formatPrice = <
  T extends Pick<ProductListingHistoryEntry, "price">,
>(
  data: T,
): string => {
  if (data.price == null) {
    return "Unavailable";
  }
  return `$${data.price?.toFixed(2) ?? " --.--"}`;
};
