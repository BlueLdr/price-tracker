export interface Product {
  name: string;
  imageUrl?: string;
  currentPrice?: number;
  lowestPrice?: ProductListingSnapshot;
  listings: ProductListing[];
  open?: boolean;
}

export interface ProductListing {
  url: string;
  productName?: string;
  imageUrl?: string;
  siteName?: string;
  siteIconUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  lowestPrice?: number;
  dateAdded: number;
  dateUpdated: number;
  history: ProductListingSnapshot[];
}

export type ProductListingSnapshot = Pick<
  ProductListing,
  "url" | "currentPrice" | "dateUpdated"
>;

export interface ProductGroup {
  name: string;
  open?: boolean;
  products: Product[];
}

export interface ProductWithUpdates extends Omit<Product, "listings"> {
  listings: (ProductListing | ParsedPageListing)[];
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
