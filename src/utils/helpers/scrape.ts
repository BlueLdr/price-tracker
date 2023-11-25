import { getMinPriceListing, parsePageData } from "~/utils";
import { IFRAME_CONTAINER_ID } from "~/utils/constants";

import type {
  ParsedPageListing,
  Product,
  ProductListing,
  ProductListingSnapshot,
  ProductWithUpdates,
} from "~/utils";

//================================================

const IFRAME_SETTLE_WAIT_TIME = 2000; // 2s
const IFRAME_WAIT_LIMIT = 10000; // 10s

export const scrapeUrl = async (
  urlString: string,
  iframeContainer?: HTMLElement | React.RefObject<HTMLElement | null> | null,
): Promise<ParsedPageListing | undefined> => {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return Promise.reject(`Invalid URL "${urlString}"`);
  }
  const response = await fetch(`/api/scrape?url=${encodeURIComponent(urlString)}`);
  if (response.status < 400 && response.status >= 200) {
    const listing = parsePageData(url, await response.text());
    if (listing) {
      return listing;
    }
  }

  console.log(`Trying iframe fetch for `, url);
  const containerArg = iframeContainer
    ? iframeContainer instanceof HTMLElement
      ? iframeContainer
      : iframeContainer.current
    : undefined;
  if (containerArg) {
    containerArg.innerHTML = "";
  }

  const container =
    containerArg || document.getElementById(IFRAME_CONTAINER_ID);

  if (!container) {
    return Promise.reject("Iframe container not found, could not fetch page");
  }

  const iframe = document.createElement("iframe");
  iframe.src = url.href;
  iframe.width = "1080px";
  iframe.height = "720px";

  const timers: any[] = [];
  return new Promise<ParsedPageListing>((resolve, reject) => {
    iframe.onload = () => {
      timers.push(
        setTimeout(() => {
          if (iframe.contentDocument) {
            const listing = parsePageData(url, iframe.contentDocument);
            if (listing) {
              return resolve(listing);
            }
          }
          reject("Failed to parse document from iframe");
        }, IFRAME_SETTLE_WAIT_TIME),
      );
    };
    container.appendChild(iframe);
    timers.push(
      setTimeout(
        () => reject("Failed to scrape from iframe in a reasonable time"),
        IFRAME_WAIT_LIMIT,
      ),
    );
  }).finally(() => {
    if (!containerArg) {
      container.removeChild(iframe);
    }
    timers.forEach(clearTimeout);
  });
};

export const createListingSnapshot = (
  data: ProductListing,
): ProductListingSnapshot => ({
  url: data.url,
  currentPrice: data.currentPrice,
  dateUpdated: data.dateUpdated,
});

export const applyListingUpdates = (
  data: ParsedPageListing,
  original?: ProductListing,
): ProductListing => ({
  url: data.url,
  productName: data.productName ?? original?.productName,
  imageUrl: data.imageUrl ?? original?.imageUrl,
  siteName: data.siteName ?? original?.siteName,
  siteIconUrl: data.siteIconUrl ?? original?.siteIconUrl,
  currentPrice: data.currentPrice ?? original?.currentPrice,
  originalPrice: original?.originalPrice ?? data.currentPrice,
  lowestPrice: original?.lowestPrice ?? data.currentPrice,
  dateAdded: original?.dateAdded ?? data.timestamp,
  dateUpdated: data.timestamp,
  history: original?.history ?? [],
});

export const createProductFromListing = (
  listing: ParsedPageListing,
): ProductWithUpdates => ({
  name: listing.productName,
  imageUrl: listing.imageUrl,
  listings: [listing],
});

export const applyProductUpdates = (
  data: ProductWithUpdates,
  original?: Product,
): Product => {
  const minListing = getMinPriceListing(data.listings || original?.listings);
  const isNewLow =
    minListing?.currentPrice ??
    Infinity < (original?.lowestPrice?.currentPrice ?? Infinity);
  return {
    name: original?.name ? data.name || original?.name : data.name,
    imageUrl: data.imageUrl || original?.imageUrl,
    currentPrice: minListing?.currentPrice,
    lowestPrice:
      minListing && isNewLow
        ? createListingSnapshot(
            "timestamp" in minListing
              ? applyListingUpdates(minListing)
              : minListing,
          )
        : original?.lowestPrice,
    listings: data.listings.map(listing =>
      "timestamp" in listing
        ? applyListingUpdates(
            listing,
            original?.listings?.find(l => l.url === listing.url),
          )
        : listing,
    ),
    open: original?.open ?? true,
  };
};
