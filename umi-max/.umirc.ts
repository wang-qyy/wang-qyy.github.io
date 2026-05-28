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
    "/hostApi": {
      // target: 'https://test.seapik.com/',
      target: "https://ajax-test.pngtree.com/",
      changeOrigin: true,
      pathRewrite: { "^/hostApi": "" },
      cookieDomainRewrite: "",
      secure: false,
    },

    "/slidesdocsApi": {
      target: "https://test.slidesdocs.com/",
      changeOrigin: true,
      pathRewrite: { "^/slidesdocsApi": "" },
      cookieDomainRewrite: "",
      secure: false,
    },
    "/supportPngTreeApi": {
      target: "https://support.pngtree.com/api-pro",
      changeOrigin: true,
      pathRewrite: { "^/supportPngTreeApi": "" },
      cookieDomainRewrite: "",
      secure: false,
    },
  },
});
