import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Inter|Hind"
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
