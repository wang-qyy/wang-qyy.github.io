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
  },
});
