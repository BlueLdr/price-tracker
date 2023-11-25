import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/space-mono"
        />
      </Head>
      <body className="font-sans text-base">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
