export function getNowFormatDate() {
  const date = new Date();
  const seperator1 = '';

  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  let strDate = date.getDate();

  if (month >= 1 && month <= 9) {
    month = `0${month}`;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = `0${strDate}`;
  }
  const currentdate = `${
    year + seperator1 + month + seperator1 + strDate
  }${hour}${minutes}${seconds}`;

  return currentdate;
}
/**
 * 转换时钟
 * @param {*} value 传入的值
 */
export function formatTimes(value: number) {
  let theTime = parseInt(value); // 秒
  let theTime1 = 0; // 分
  let theTime2 = 0; // 小时
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    if (theTime1 > 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
    }
  }
  let result = (theTime >= 10 ? '' : '0') + parseInt(theTime);
  result = `${(theTime1 >= 10 ? '' : '0') + parseInt(theTime1)}:${result}`;
  // if (theTime2 > 0) {
  result = `${(theTime2 >= 10 ? '' : '0') + parseInt(theTime2)}:${result}`;
  // }
  return result;
}
