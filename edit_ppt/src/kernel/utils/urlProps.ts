let params: Record<string, string> = {};
let urlCache = '';
export default () => {
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
