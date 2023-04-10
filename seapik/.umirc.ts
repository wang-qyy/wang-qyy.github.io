import { defineConfig } from 'umi';
import theme from './src/style/theme';
import { cdnHost } from './src/config/urls';

const isProd = process.env.NODE_ENV === 'production';

const publicPath = isProd
  ? 'https://wang-qyy.github.io/seapik/dist/'
  : 'http://localhost:8888/';
const scriptMiddleFilename = isProd ? '.min' : '';

const version = 'v1';

export default defineConfig({
  title: 'pngtree editor',
  mountElementId: 'seapik',
  devServer: { port: 9999 },
  links: [
    {
      rel: 'icon',
      href: 'https://pngtree.com/favicon.svg',
    },
  ],
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  proxy: {
    '/mainHostApi': {
      target: 'https://seapik.com/',
      // target:'https://ajax.pngtree.com/',
      changeOrigin: true,
      pathRewrite: { '^/mainHostApi': '' },
      cookieDomainRewrite: '',
      secure: false,
    },
  },
  copy: [
    {
      from: 'static',
      to: 'static',
    },
  ],
  externals: {
    fabric: 'window.fabric',
  },
  scripts: [
    `${publicPath}static/lib/fabric/4.6.0/fabric${scriptMiddleFilename}.js`,
    `${publicPath}static/lib/react/17.0.2/react${scriptMiddleFilename}.js`,
  ],
  theme,
  alias: {
    '@kernel': '/src/kernel',
    '@AssetCore': '/src/kernel/Asset/',
  },
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
