import iconfontPath from './iconfont?static';

const isProd = process.env.NODE_ENV === 'production';
export const hostName = isProd ? 'xiudodo.com' : 'localhost:3001/mainHostApi';
// export const hostName = 'xiudodo.com';
export const saveHostName = `save.${hostName}`;
export const downloadHostName = `download.${hostName}`;
export const cdnHost = `//js.xiudodo.com`;

// cdn地址，主要放置公共静态资源
export const ossRoot = `${cdnHost}/xiudodo`;
// cdn地址，主要放置编辑器静态资源
export const ossEditor = `${cdnHost}/xiudodo-editor`;

// export const iconSrc = '//at.alicdn.com/t/c/font_2484305_c7mki0bayjg.js';
// export const iconSrc = `${ossEditor}/iconfont/font_2484305_vnord946agf/iconfont.js`;
export const iconSrc = iconfontPath;

// export const iconpark = 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_10609_83.956a3c7d868c0d5f6d07816fe838aa4e.js';
export const iconpark = `${ossEditor}/iconfont/iconpark/svg_10609_112.8a708c8558f13afcd49fe038a050d6b2.js`;
/**
 * @description 用于拼接请求链接
 * @param path
 */
export function ossPath(path: string) {
  const slash = path[0] === '/' ? '' : '/';
  return `${ossRoot}${slash}${path}`;
}

export function ossEditorPath(path: string) {
  const slash = path[0] === '/' ? '' : '/';
  return `${ossEditor}${slash}${path}`;
}
