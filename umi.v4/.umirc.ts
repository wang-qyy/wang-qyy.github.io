import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "ppt" },
  ],
  npmClient: "yarn",
  clickToComponent: {
    editor: 'vscode',
  },
});
