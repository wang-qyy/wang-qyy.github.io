import { defineConfig } from "umi";

export default defineConfig({
  proxy: {
    "/imageHost": {
      target: "https://png.pngtree.com/",
      changeOrigin: true,
      pathRewrite: { "^/imageHost": "" },
      cookieDomainRewrite: "",
      secure: false,
    },
    "/maker-ppt": {
      target: "https://cdna-candles-incorrect-ram.trycloudflare.com/",
      changeOrigin: true,
      pathRewrite: { "^/maker-ppt": "" },
      cookieDomainRewrite: "",
      secure: false,
    },
  },
});
