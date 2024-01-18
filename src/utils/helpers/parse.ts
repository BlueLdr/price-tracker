import type { ParsedPageListing } from "~/utils";

//================================================

const getElementByXPath = (
  doc: Document,
  xpath: string,
): HTMLElement | void => {
  const result = doc.evaluate(
    xpath,
    doc,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
  ).singleNodeValue;
  if (result instanceof HTMLElement) {
    return result;
  }
};

const parsePrice = (text: string | null | undefined) => {
  if (text == null) {
    return;
  }
  const value = Number(text.replace(/[^0-9.]/g, ""));
  return isNaN(value) ? undefined : value;
};

//================================================

type ParseableProperty = Exclude<
  keyof ParsedPageListing,
  "url" | "timestamp" | "siteIconUrl"
>;
type PropertyParser<K extends ParseableProperty> = (
  doc: Document,
) => ParsedPageListing[K];

const SITE_PARSER_MAP: Record<
  string,
  { [K in ParseableProperty]?: PropertyParser<K> }
> = {
  "www.guitarcenter.com": {
    currentPrice: doc =>
      parsePrice(
        getElementByXPath(
          doc,
          "//*[contains(@class,'price-format')][contains(text(),'$')]",
        )?.textContent,
      ),
    siteName: () => "Guitar Center",
  },
  "www.amazon.com": {
    currentPrice: doc =>
      parsePrice(
        doc.querySelector(
          ".priceToPay .a-offscreen, .apexPriceToPay .a-offscreen, .a-price .a-offscreen",
        )?.textContent,
      ),
    imageUrl: doc =>
      (doc.getElementById("landingImage") as HTMLImageElement).src,
    productName: doc => doc.getElementById("productTitle")?.textContent ?? "",
    siteName: () => "Amazon",
  },
  "www.lowes.com": {
    currentPrice: doc =>
      parsePrice(
        doc.querySelector(".main-price")?.textContent ||
          getElementByXPath(
            doc,
            '//*[contains(text(),"finalPrice")]',
          )?.textContent?.replace(/.*"finalPrice":\s*([0-9.]+).*/i, "$1"),
      ),
  },
  "www.homedepot.com": {
    currentPrice: doc =>
      parsePrice(
        doc.querySelector(".main-price")?.textContent ||
          getElementByXPath(
            doc,
            "//*[contains(text(),'\"price\"')]",
          )?.textContent?.replace(/.*"price":\s*([0-9.]+).*/i, "$1"),
      ),
  },
};

const DEFAULT_PARSER: { [K in ParseableProperty]: PropertyParser<K> } = {
  siteName: doc =>
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content") || "",
  productName: doc =>
    doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
    doc.querySelector("title")?.textContent ||
    "",
  imageUrl: doc =>
    doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
    "",
  currentPrice: doc =>
    parsePrice(
      doc
        .querySelector('meta[property="product:price:amount"]')
        ?.getAttribute("content") || doc.getElementById("price")?.textContent,
    ),
};

const getParser = <K extends ParseableProperty>(
  url: URL,
  key: K,
): PropertyParser<K> =>
  SITE_PARSER_MAP[url.hostname]?.[key] || DEFAULT_PARSER[key];

//================================================

export const parsePageData = (
  url: URL,
  data: string | Document,
): ParsedPageListing | undefined => {
  let doc: Document;

  if (typeof data === "string") {
    const parser = new DOMParser();
    doc = parser.parseFromString(data, "text/html");
  } else {
    doc = data;
  }

  return {
    url: url.href,
    timestamp: Date.now(),
    siteName: (getParser(url, "siteName")(doc) || url.origin)?.trim(),
    productName: getParser(url, "productName")(doc)?.trim(),
    imageUrl: getParser(url, "imageUrl")(doc),
    currentPrice: getParser(url, "currentPrice")(doc),
    siteIconUrl: `https://s2.googleusercontent.com/s2/favicons?domain_url=${encodeURIComponent(
      url.hostname,
    )}`,
  };
};
