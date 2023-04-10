let params: UrlParams;
let urlCache = '';

interface UrlParams {
  pid?: string;
  source_from?: 'pngtree' | string;
  token?: string;
  w: string;
  h: string;
  is_designer?: '0' | '1'; // 1-内容生产
  draft_id?: number; // 草稿ID
  model?: 'ppt' | '';
  tid?: string; // ppt模板ID
}

export default () => {
  const tempStr = document.location.href;
  if (tempStr !== urlCache) {
    urlCache = tempStr;

    let tempArr;

    params = {} as UrlParams;

    tempArr = tempStr.split('?');
    tempArr = tempArr[1] ? tempArr[1] : '';
    tempArr = tempArr.split('&');

    tempArr.forEach((item: string) => {
      const [key, value] = item.split('=');
      if (key) {
        params[key] = value;
      }
    });
  }

  return params;
};
