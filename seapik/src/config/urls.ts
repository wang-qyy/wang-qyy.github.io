const isProd = process.env.NODE_ENV === 'production';
export const hostName = isProd
  ? window.location.host === 'edit.seapik.com'
    ? 'seapik.com'
    : 'pngtree.com'
  : 'seapik.com';

export const cdnHost = `https://js.${hostName}`;
export const fontsPath = `${cdnHost}/fonts/`;

export const iconSrc = '//at.alicdn.com/t/c/font_3765410_n5nwxenvlm.js';

const pngtreeSrc = {
  logo: 'https://js.pngtree.com/web3/images/spring-logo.jpg',
  ico: 'https://pngtree.com/favicon.ico',
  home: 'https://pngtree.com/free-backgrounds',
};

const seapikSrc = {
  logo: '//js.seapik.com/static/seapik_v1.png',
  ico: '//js.seapik.com/static/favicon.png',
  home: 'https://test.seapik.com/popular-images',
};
export const globalLink =
  isProd && window.location.host === 'edit.pngtree.com'
    ? pngtreeSrc
    : seapikSrc;
