const isProd = process.env.NODE_ENV === 'production';
export const hostName = isProd
  ? window.location.host === 'edit.seapik.com'
    ? 'seapik.com'
    : 'pngtree.com'
  : 'seapik.com';

export const cdnHost = `https://js.${hostName}`;
export const fontsPath = `${cdnHost}/fonts/`;

export const iconSrc = '//at.alicdn.com/t/c/font_3765410_9fvnwdhzye.js';
