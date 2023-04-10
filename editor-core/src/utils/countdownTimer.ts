import { formatTimeItem } from "@/utils/single";

export default (time: number) => {
  const nowTime = new Date(); // 获取当前时间

  const leftTime = time * 1000 - nowTime.getTime(); // 距离结束时间的毫秒数
  const strTime = `${leftTime}`;
  const min = Math.floor((leftTime / 1000 / 60) % 60);
  const sec = Math.floor((leftTime / 1000) % 60);
  const ms = strTime.substring(strTime.length - 3, strTime.length - 1);
  if (leftTime > 0) {
    const m = formatTimeItem(min);
    const s = formatTimeItem(sec);
    return `${m}:${s}:${ms}`; // 返回倒计时的字符串
  }
  return "00:00:00";
};
