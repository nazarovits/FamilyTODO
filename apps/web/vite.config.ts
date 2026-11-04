import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const webRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, webRoot, "");
  const webAppUrl = env.WEB_APP_URL;
  let allowedHosts: string[] = [];

  if (webAppUrl) {
    const configuredUrl = webAppUrl.trim();
    const urlWithScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(configuredUrl)
      ? configuredUrl
      : `https://${configuredUrl}`;

    try {
      const parsedUrl = new URL(urlWithScheme);
      if (
        (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") ||
        parsedUrl.username ||
        parsedUrl.password
      ) {
        throw new Error();
      }
      allowedHosts = [parsedUrl.hostname];
    } catch {
      throw new Error(
        "WEB_APP_URL in apps/web/.env.local must be a valid HTTP(S) URL or hostname.",
      );
    }
  }

  return {
    plugins: [react()],
    server: {
      allowedHosts,
      proxy: {
        "/api": "http://localhost:3001",
      },
    },
  };
});
