export const getNodeFixedPosition = (node: Element) => {
  const { left, top } = node.getBoundingClientRect();
  return {
    left,
    top,
  };
};

/**
 * @description 将毫秒转换为字符串展示结构 M:S.ms
 * @param ms
 */
export function msToSeconds(ms: number) {
  let msString = `${ms || '000'}`;
  if (ms < 10) {
    msString = `00${ms}`;
  } else if (ms < 100) {
    msString = `0${ms}`;
  }

  let min: number | string = ms / 1000 / 60;
  const r = min % 1;
  let sec: number | string = Math.floor(r * 60);
  if (sec < 10) {
    sec = `0${sec}`;
  }
  if (min < 10) {
    min = `0${Math.floor(min)}`;
  }
  return {
    m: min,
    s: sec,
    ms: msString.slice(-3, -1),
  };
}
