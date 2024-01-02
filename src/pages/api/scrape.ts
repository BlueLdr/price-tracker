import type { NextApiRequest, NextApiResponse } from "next";

const shouldExcludeHeader = (key: string) => {
  if (
    [
      "content-length",
      "content-type",
      "set-cookie",
      "referer",
      "host",
    ].includes(key)
  ) {
    return true;
  }
  return /^x-.*/i.test(key);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const urlString = req.query?.url;
  if (!urlString || typeof urlString !== "string") {
    res.status(404);
    res.end();
    return;
  }
  const url = new URL(urlString);

  const config = {
    headers: Object.entries(req?.headers)
      .map(([key, value]) => [
        key,
        shouldExcludeHeader(key)
          ? undefined
          : Array.isArray(value)
          ? value.join(",")
          : value,
      ])
      .filter(([, value]) => value != null) as [string, string][],
  };
  config.headers.push(["Host", url.host]);

  await fetch(urlString, config).then(async response => {
    res.end(await response.text());
  });
}
