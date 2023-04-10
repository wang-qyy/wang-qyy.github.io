import { defineConfig } from 'umi';

const isProd = process.env.NODE_ENV === 'production';
const publicPath = isProd
  ? // ? 'https://wang-qyy.github.io/demo/dist/'
    './'
  : 'http://localhost:9999/';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  devServer: {
    port: 9999,
  },
  routes: [
    // { path: '/', component: '@/pages/index' },
    { path: '/', component: '@/pages/ppt' },
  ],
  fastRefresh: {},
  publicPath,
});
