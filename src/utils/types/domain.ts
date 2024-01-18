//================================================
// serializable data
//================================================

export interface ProductData {
  name: string;
  imageUrl?: string;
  listings: ProductListingData[];
  open?: boolean;
}

export interface ProductListingData {
  url: string;
  productName?: string;
  imageUrl?: string;
  siteName?: string;
  siteIconUrl?: string;
  history: ProductListingHistoryEntry[];
}

export interface ProductListingHistoryEntry {
  price?: number;
  dateAdded: number;
  dateUpdated: number;
  acknowledged?: boolean;
}

export type ProductListingSnapshot = ProductListingHistoryEntry &
  Pick<ProductListingData, "url" | "siteIconUrl" | "siteName">;

export interface ProductGroup {
  name: string;
  open?: boolean;
  products: ProductData[];
}

export interface ProductWithUpdates extends Omit<ProductData, "listings"> {
  listings: (ProductListingData | ParsedPageListing)[];
}

export interface ParsedPageListing {
  url: string;
  siteName: string;
  productName: string;
  timestamp: number;
  currentPrice?: number;
  imageUrl?: string;
  siteIconUrl?: string;
}
