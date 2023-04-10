import { baseFrames, frameInterval } from './const';
import { AeAKw } from './typing';

/**
 * @description 时间转换为帧数
 * @param time
 */
export function MSToFrame(time: number) {
  return Math.round(time / 1000 / frameInterval);
}

/**
 * @description 帧数转换为毫秒
 * @param frame
 */
export function frameToMS(frame: number) {
  return (frame / baseFrames) * 1000;
}

/**
 * @description 根据bpr缩放出入帧
 * @param p
 * @param pbr
 */
export function calcKwpByPbr(p: number, pbr: number) {
  return Math.round(p / pbr);
}

/**
 * @description 计算动画播放完毕所需要的时间ms
 * @param kw
 * @param pbr
 */
export function calcAeAFrameToTime(kw: AeAKw, pbr: number) {
  const frames = calcKwpByPbr(kw.op, pbr) - calcKwpByPbr(kw.ip, pbr);
  return Math.round(frameToMS(frames));
}

/**
 * @description 将预期的动画播放持续时间转化为相应的播放倍速
 * @param ms
 * @param kw
 */
export function calcAeATimeToPbr(ms: number, kw: AeAKw) {
  const frames = (ms / 1000) * baseFrames;
  return (kw.op - kw.ip) / frames;
}
