import { defineConfig } from "umi";

const isProd = process.env.NODE_ENV === "production";
const publicPath = isProd
  ? "https://wang-qyy.github.io/umi.v4/dist/"
  : "http://localhost:8000/";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/ppt", component: "ppt" },
  ],
  npmClient: "yarn",
  clickToComponent: {
    editor: "vscode",
  },
  // publicPath
});
