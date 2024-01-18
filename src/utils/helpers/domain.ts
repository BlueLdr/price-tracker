import type {
  ProductData,
  ProductListingData,
  ProductListingHistoryEntry,
  ProductListingSnapshot,
} from "~/utils";

//================================================

export const getMinPriceListing = <
  T extends Pick<ProductListingSnapshot, "price">,
>(
  listings: T[],
): T | undefined =>
  listings.reduce(
    (min, item) =>
      (min?.price ?? Infinity) > (item.price ?? Infinity) ? item : min,
    undefined as T | undefined,
  );

export const createListingSnapshot = (
  data: ProductListingData,
  historyEntry: ProductListingHistoryEntry,
): ProductListingSnapshot => {
  return {
    url: data.url,
    price: historyEntry.price,
    dateUpdated: historyEntry.dateUpdated,
    dateAdded: historyEntry.dateAdded,
    acknowledged: historyEntry.acknowledged,
    siteIconUrl: data.siteIconUrl,
    siteName: data.siteName,
  };
};

export const acknowledgeListingAlert = (
  data: ProductListingData,
): ProductListingData => ({
  ...data,
  history: data.history.map(entry => ({ ...entry, acknowledged: true })),
});

//================================================

export class Product implements ProductData {
  constructor(data: ProductData) {
    this.name = data.name;
    this.imageUrl = data.imageUrl;
    this.listings = data.listings;
    this.open = data.open;

    const listings = this.listings.map(l => new ProductListing(l));
    this.currentPrice = getMinPriceListing(listings.map(l => l.currentPrice));
    this.lowestPrice = getMinPriceListing(listings.map(l => l.lowestPrice));

    const earliestListings = listings.map(l =>
      createListingSnapshot(l, l.history[0]),
    );
    const dateCreated = Math.min(...earliestListings.map(l => l.dateAdded));
    const originalListings = earliestListings.filter(
      l => l.dateAdded <= dateCreated + 9 * 60 * 1000,
    );
    this.originalPrice = getMinPriceListing(originalListings);

    this.dateAdded = dateCreated;
    this.dateUpdated = this.currentPrice?.dateUpdated ?? dateCreated;

    this.previousPrice = getMinPriceListing(
      this.listings
        .map(l => {
          const lastEntryBeforeCurrentPrice = l.history.findLast(
            e => e.dateAdded < (this.currentPrice?.dateAdded ?? -1),
          );
          return lastEntryBeforeCurrentPrice
            ? createListingSnapshot(l, lastEntryBeforeCurrentPrice)
            : undefined;
        })
        .filter(l => l != null) as ProductListingSnapshot[],
    );

    const hasComparablePriceEntries =
      this.previousPrice?.price != null && this.currentPrice?.price != null;
    this.priceDropped =
      hasComparablePriceEntries &&
      (this.currentPrice?.price as number) <
        (this.previousPrice?.price as number);
    this.priceIsLowest =
      this.currentPrice?.price != null &&
      this.currentPrice?.price === this.lowestPrice?.price;

    this.priceIsNewLow = listings.some(
      l =>
        l.priceIsNewLow &&
        l.currentPrice.dateAdded === this.currentPrice?.dateAdded,
    );

    this.priceIncreased =
      hasComparablePriceEntries &&
      (this.currentPrice?.price as number) >
        (this.previousPrice?.price as number);
  }

  name: string;
  imageUrl?: string;
  listings: ProductListingData[];
  open?: boolean;

  currentPrice?: ProductListingSnapshot;
  originalPrice?: ProductListingSnapshot;
  lowestPrice?: ProductListingSnapshot;
  previousPrice?: ProductListingSnapshot;
  dateAdded: number;
  dateUpdated: number;

  priceDropped?: boolean;
  priceIsLowest?: boolean;
  priceIsNewLow?: boolean;
  priceIncreased?: boolean;

  toString() {
    const obj: any = {};
    (["name", "imageUrl", "listings", "open"] as const).forEach(key => {
      if (this[key] != null) {
        obj[key] = this[key];
      }
    });
    return JSON.stringify(obj);
  }
}

//================================================

export class ProductListing implements ProductListingData {
  constructor(data: ProductListingData) {
    this.url = data.url;
    this.productName = data.productName;
    this.imageUrl = data.imageUrl;
    this.siteName = data.siteName;
    this.siteIconUrl = data.siteIconUrl;
    this.history = data.history;

    this.lowestPrice = createListingSnapshot(
      this,
      getMinPriceListing(this.history) ?? {
        dateAdded: 0,
        dateUpdated: 0,
      },
    );

    this.currentPrice = createListingSnapshot(
      this,
      this.history.slice(-1)[0] ?? {
        dateAdded: 0,
        dateUpdated: 0,
      },
    );

    this.originalPrice = createListingSnapshot(
      this,
      this.history[0] ?? {
        dateAdded: 0,
        dateUpdated: 0,
      },
    );

    const lastAvailablePrice = this.history.findLast(
      (entry, index) => index < this.history.length - 1 && entry.price != null,
    );
    this.previousPrice =
      this.history.length > 1 && lastAvailablePrice
        ? createListingSnapshot(this, lastAvailablePrice)
        : undefined;

    this.dateAdded = this.originalPrice.dateAdded;
    this.dateUpdated = this.currentPrice.dateUpdated;

    const hasComparablePriceEntries =
      this.previousPrice?.price != null && this.currentPrice.price != null;
    this.priceDropped =
      hasComparablePriceEntries &&
      (this.currentPrice.price as number) <
        (this.previousPrice?.price as number);
    this.priceIsLowest =
      this.currentPrice.price != null &&
      this.currentPrice.price === this.lowestPrice.price;
    this.priceIsNewLow =
      this.priceDropped &&
      this.priceIsLowest &&
      this.history.every(
        entry =>
          entry.price == null ||
          this.currentPrice.dateAdded === entry.dateAdded ||
          (this.currentPrice.price ?? 0) < entry.price,
      );
    this.priceIncreased =
      hasComparablePriceEntries &&
      (this.currentPrice.price as number) >
        (this.previousPrice?.price as number);
  }

  url: string;
  productName?: string;
  imageUrl?: string;
  siteName?: string;
  siteIconUrl?: string;
  history: ProductListingHistoryEntry[];

  currentPrice: ProductListingSnapshot;
  originalPrice: ProductListingSnapshot;
  lowestPrice: ProductListingSnapshot;
  previousPrice?: ProductListingSnapshot;
  dateAdded: number;
  dateUpdated: number;

  priceDropped: boolean;
  priceIsLowest: boolean;
  priceIsNewLow: boolean;
  priceIncreased: boolean;

  toString() {
    const obj: any = {};
    (
      [
        "url",
        "productName",
        "imageUrl",
        "siteName",
        "siteIconUrl",
        "history",
      ] as const
    ).forEach(key => {
      if (this[key] != null) {
        obj[key] = this[key];
      }
    });
    return JSON.stringify(obj);
  }
}
