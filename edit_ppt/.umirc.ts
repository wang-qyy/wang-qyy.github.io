// @ts-nocheck
import { defineConfig } from 'umi';
import theme from './src/style/theme';
import { execSync } from 'child_process';

const isProd = process.env.NODE_ENV === 'production';
const publicPath = isProd
  ? 'https://wang-qyy.github.io/edit_ppt/dist/'
  : 'http://localhost:1111/';
// process.env.SENTRY_AUTH_TOKEN = '832cf192e4b543f9a46c89a458ce7ea3d2fe065768884f09bbf7ada1c7b1743e';
const scriptMiddleFilename = isProd ? '.min' : '';

const version = 'v1';

export default defineConfig({
  nodeModulesTransform: {
    type: isProd ? 'all' : 'none',
    exclude: isProd
      ? ['crypto-random-string', 'dexie', 'p-queue', 'p-timeout'] // 如果发生某模块build报错, 可以添加到此数组中不走编译
      : [],
  },
  title: 'pngtree editor',
  dynamicImport: {},
  routes: [
    { path: '*', component: '@/pages/ppt' }, // 视频编辑器生产配置
  ],
  fastRefresh: {},
  antd: {},
  webpack5: {},
  theme,
  copy: [
    {
      from: 'static',
      to: 'static',
    },
  ],
  define: {
    // umi 除 NODE_ENV 外的其他环境变量都传不到项目文件中，所以才用 define 来定义
    __IS_TEST__: process.env.IS_TEST,
    // __SENTRY_RELEASE__: execSync('sentry-cli releases propose-version')
    //   .toString('utf8')
    //   .trim(),
    __SENTRY_DSN__: process.env.SENTRY_DSN,
  },
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    fabric: 'window.fabric',
    'lottie-web': 'window.lottie',
  },
  scripts: [
    `${publicPath}static/lib/react/17.0.2/react${scriptMiddleFilename}.js`,
    `${publicPath}static/lib/react-dom/17.0.2/react-dom${scriptMiddleFilename}.js`,
    `${publicPath}static/lib/fabric/4.6.0/fabric${scriptMiddleFilename}.js`,
    `${publicPath}static/lib/lottie/5.7.13/lottie${scriptMiddleFilename}.js`,
    `window.__EDITOR_PERFORMANCE__.all_resorce_loaded = new Date().getTime();`,
  ],
  // devtool: !isProd ? 'cheap-module-source-map' : 'source-map',
  mountElementId: 'seapik',
  devServer: { port: 1111 },
  proxy: {
    '/mainHostApi': {
      target: 'https://seapik.com/',
      changeOrigin: true,
      pathRewrite: { '^/mainHostApi': '' },
      cookieDomainRewrite: '',
      secure: false,
    },
  },
  alias: {
    '@kernel': '/src/kernel',
    '@hc/editor-core': '/src/kernel',
    '@AssetCore': '/src/kernel/Asset/',
  },
  publicPath,
  dynamicImportSyntax: {},
  chainWebpack(config, { env, webpack, createCSSRule }) {
    config.module
      .rule('static-file')
      .resourceQuery(/static/)
      .type('javascript/auto')
      .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: '[name].[contenthash:8].[ext]',
        outputPath: 'static/',
      })
      .end();

    if (isProd) {
      config.output.filename(`${version}/js/bundle.[contenthash:8].js`);
      config.output.chunkFilename(
        `${version}/js/chunk.[name].[contenthash:8].js`,
      );
      config.plugins.get('extract-css').tap((args) => {
        return [
          {
            ...args,
            filename: `${version}/css/bundle.[contenthash:8].css`,
            chunkFilename: `${version}/css/bundle.[contenthash:8].css`,
          },
        ];
      });
    }
  },
});

