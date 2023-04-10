let params: Record<string, string> = {};
let urlCache = '';

interface UrlParams {
  renovate_type?: 'cover' | 'new';
  redirect?: 'designer' | 'module' | 'watermark';
  upicId?: string; // 用户草稿ID
  picId?: string; // 模板ID
  blankSize?: string; // 空模板尺寸 eg:1080*1920
  template_version?: string; // 模板版本 eg: 'v1'
  resourceId?: string; // 资源gid
}

export default (): UrlParams => {
  const tempStr = document.location.href;
  if (tempStr !== urlCache) {
    urlCache = tempStr;

    let tempArr;

    params = {};

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
