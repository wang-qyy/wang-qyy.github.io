import { defineConfig } from 'umi';

const isProd = process.env.NODE_ENV === 'production';

const publicPath = isProd ? 'https://wang-qyy.github.io/editor/' : 'http://localhost:8888/';


export default defineConfig({
  title: false,
  devServer: { port: 3333 },
  mountElementId: 'editor',
  // links: [
  //   {
  //     rel: 'icon',
  //     href: '/favicon.svg',
  //   },
  // ],
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
    // { path: '/ppt', component: '@/pages/ppt/index' },
  ],
  // proxy: {
  //   '/mainHostApi': {
  //     target: 'https://seapik.com/',
  //     // target:'https://ajax.pngtree.com/',
  //     changeOrigin: true,
  //     pathRewrite: { '^/mainHostApi': '' },
  //     cookieDomainRewrite: '',
  //     secure: false,
  //   },
  // },
  // copy: [
  //   {
  //     from: 'static',
  //     to: 'static',
  //   },
  // ],
  // externals: {
  //   fabric: 'window.fabric',
  // },

  fastRefresh: {},
  publicPath,
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
      config.output.filename(`bundle.[contenthash:8].js`);
      config.output.chunkFilename(
        `chunk.[name].[contenthash:8].js`,
      );
      config.plugins.get('extract-css').tap((args) => {
        return [
          {
            ...args,
            filename: `bundle.[contenthash:8].css`,
            chunkFilename: `bundle.[contenthash:8].css`,
          },
        ];
      });
    }
  },
});
