import { getAllTemplateVideoTime } from '@hc/editor-core';
import { message } from 'antd';
import {
  templateTotalDurationLimit,
  TIME_OUT_TIP,
} from '@/config/basicVariable';

/**
 * @param incrementalTime 时间增量
 * @param callback 回调 返回检测结果 boolean
 * */
export function checkTotalTime(params: {
  incrementalTime: number; // 时间增量
  callback?: (exceed: boolean) => void;
  tip?: boolean;
}) {
  const { incrementalTime, callback, tip = true } = params;

  const videoTotalTime = getAllTemplateVideoTime();

  const exceed = videoTotalTime + incrementalTime > templateTotalDurationLimit;

  if (exceed && tip) {
    message.info(TIME_OUT_TIP);
  }
  if (callback) {
    callback(exceed);
  }

  return exceed;
}
