import { defineConfig, loadEnv } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteSingleFile } from "vite-plugin-singlefile";

import type { Plugin } from "vite";

var envPrefix = ["MY_UI_", "VITE_", "BASE_URL"] as string[];

const ENV_VAR_DEFAULTS = {};

// https://vitejs.dev/config/
export default defineConfig(config => {
  var env = loadEnv(config.mode, ".", envPrefix);
  env = Object.assign({}, ENV_VAR_DEFAULTS, env);
  return {
    plugins: [
      react(),
      tsconfigPaths({
        projects: ["."],
      }),
      svgr(),
      htmlPlugin(env),
      basicSsl(),
      // mkcert(),
      viteSingleFile({
        inlinePattern: ["**/*.js"],
        deleteInlinedFiles: true,
      }),
    ],
    envPrefix,
    build: {
      chunkSizeWarningLimit: 1000,
    },
    server: {
      https: true,
      port: 3001,
    },
    base: "/price-tracker",
  };
});

/**
 * Replace env variables in index.html
 * @see https://github.com/vitejs/vite/issues/3105#issuecomment-999473946
 * @see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
function htmlPlugin(env: ReturnType<typeof loadEnv>) {
  return {
    name: "html-transform",
    transformIndexHtml: {
      enforce: "pre" as const,
      transform: (html: string): string =>
        html.replace(/<%(.*?)%>/g, (match, p1) => env[p1] ?? match),
    },
  };
}
