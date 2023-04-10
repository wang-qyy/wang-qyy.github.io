import { calcPxToTime, calcTimeToPx } from '@/components/TimeLine';
import { TimeLineOpts } from '@/components/TimeLine/types';
import {
  activeEditableAsset,
  assetBlur,
  setCurrentTimeWithThrottle,
  updateAssetDuration,
  useAllTemplateVideoTimeByObserver as allTemplateVideoTime,
  useTemplateClip as getTemplateClip,
  useVideoClipByObserver as getVideoClipByObserver,
  useVideoHandler,
} from '@/kernel';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { clickActionWeblog } from '@/utils/webLog';
import { message } from 'antd';

import { clamp } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';
import { reSortAsset } from '../../hooks/asset';
import { bgTrackTypes, partTimeLimit, trackTypes } from '../../options';
import timeLinePageStore from '../../store';

// 普通元素时间轴配置
export const useAssetTimelineOptions = () => {
  const timelineOptions: TimeLineOpts = useMemo(() => {
    return {
      adsorbLimit: 50,
      onMouseDown: info => {
        const { record, event } = info;
        event.stopPropagation();

        // 设置选中状态
        assetBlur();
        record.asset && activeEditableAsset(record.asset);
        // record.asset && setAssetIntoView(record.asset, record.asset?.template);
      },
      onMouseMove: info => {
        const { record, changeType } = info;
        if (changeType === 'move' && record.disableDrag) {
          message.info({ content: '图层已锁定，请先解锁', key: record.id });
        }
      },
      onTimeChangeEnd: info => {
        let { startTime, endTime } = info;
        const { record, changeType } = info;
        // 时间保留整数
        startTime = Math.ceil(startTime);
        endTime = Math.ceil(endTime);

        const asset = record.asset as AssetItemState;
        const {
          meta: { type },
          attribute: { rt_total_time },
        } = asset;

        // updateAssetDuration(asset, { startTime, endTime });

        clickActionWeblog(changeType === 'move' ? 'Timeline8' : 'Timeline7');

        if (changeType === 'move' || !['video', 'videoE'].includes(type)) {
          updateAssetDuration(asset, { startTime, endTime });
          return;
        }

        const { value, update } = getVideoClipByObserver(); // 视频裁剪
        // // 视频元素拖拽两端
        const changedStart = Math.min(
          record.startTime - startTime,
          value.startTime,
        );
        // console.log('rt_total_time', rt_total_time, value.startTime, value.endTime);
        const changedEnd = Math.min(
          endTime - record.endTime,
          rt_total_time - value.endTime,
        );
        // // const newStart = record.startTime - changedStart;
        // // const newEnd = record.startTime + changedEnd;

        if (!changedStart && !changedEnd) return;

        updateAssetDuration(asset, {
          startTime: record.startTime - changedStart,
          endTime: record.endTime + changedEnd,
        });
        update({
          startTime: value.startTime - changedStart,
          endTime: value.endTime + changedEnd,
        });

        // const asset.
      },
      onTrackChange: info => {
        reSortAsset(info);
      },
      trackTypes,
    };
  }, []);

  return timelineOptions;
};

// 背景时间轴配置
export const useBgTimelineOptions = (scrollEle: HTMLDivElement | null) => {
  const clipRef = useRef([0, 0]);
  const timer = useRef();
  const diffEndRef = useRef(0);
  const { setHiddenPointer } = timeLinePageStore;
  const { currentTime } = useVideoHandler();

  // 拉到浏览器右边末尾时，自动滚动并且增加片段时长
  const autoUpdateTemplate = (templateIndex: number) => {
    const { timeLineScale } = timeLinePageStore;
    const [value, update] = getTemplateClip(templateIndex);
    let diffEnd = calcPxToTime(20, timeLineScale);
    const [countTempTime] = allTemplateVideoTime();
    // 不能超过片段总时长
    if (countTempTime + diffEnd > partTimeLimit) return;
    diffEnd = clamp(diffEnd, 0, partTimeLimit - countTempTime);
    update([value[0], value[1] - diffEnd]);
    scrollEle && scrollEle.scrollBy(20, 0);
  };

  useEffect(() => {
    return () => {
      clearInterval(timer.current);
    };
  }, []);

  const timelineOptions: TimeLineOpts = useMemo(() => {
    return {
      onMouseDown: info => {
        const { changeType } = info;
        if (changeType === 'end' || changeType === 'start') {
          clipRef.current = [0, 0];
          diffEndRef.current = 0;
          // setHiddenPointer(true);
        }
      },
      onMouseMove: info => {
        const { record, event, changeType } = info;
        const { templateIndex } = record;
        const { clientX } = event;
        const { clientWidth } = document.body;
        clearInterval(timer.current);

        // 拉到浏览器右边末尾时，自动滚动并且增加片段时长
        if (clientWidth - clientX < 20 && scrollEle && changeType === 'end') {
          // 先更新一次
          const [value, update] = getTemplateClip(templateIndex);
          update([
            value[0],
            value[1] + diffEndRef.current - clipRef.current[1],
          ]);
          // 记录本次变化的时间 具体逻辑先了解 getTemplateClip update 方法的逻辑
          clipRef.current[1] = diffEndRef.current;
          // @ts-ignore
          timer.current = setInterval(() => {
            autoUpdateTemplate(templateIndex);
          }, 100);
        }
      },
      // onTimeChange: info => {
      //   const { startTime, endTime, record } = info;
      //   const { templateIndex } = record;
      //   const diffStart = startTime - record.startTime;
      //   const diffEnd = record.endTime - endTime;

      //   const [value, update] = getTemplateClip(templateIndex);

      //   update([
      //     value[0] + diffStart - clipRef.current[0],
      //     value[1] + diffEnd - clipRef.current[1],
      //   ]);
      //   // 记录本次变化的时间 具体逻辑先了解 getTemplateClip update 方法的逻辑
      //   clipRef.current[0] = diffStart;
      //   clipRef.current[1] = diffEnd;
      // },

      onTimeChange: info => {
        const { startTime, endTime, record, changeType } = info;
        const { templateIndex } = record;
        const diffStart = startTime - record.startTime;
        const diffEnd = record.endTime - endTime;

        const { templates, updateTemplate, timeLineScale } = timeLinePageStore;
        const currentTemp = templates[templateIndex];
        const { offsetTime } = currentTemp;

        diffEndRef.current = diffEnd;

        if (changeType === 'start') {
          setCurrentTimeWithThrottle(offsetTime + diffStart, false);
          updateTemplate(currentTemp, {
            paddingLeft: -calcTimeToPx(diffStart, timeLineScale),
          });
        } else {
          updateTemplate(currentTemp, {
            paddingRight: -calcTimeToPx(diffEnd, timeLineScale),
          });
          setCurrentTimeWithThrottle(
            offsetTime + currentTemp.endTime - diffEnd,
            false,
          );
        }

        // if (diffStart < 0 || diffEnd < 0) {
        //   const [value, update] = getTemplateClip(templateIndex);
        //   update([
        //     value[0] + diffStart - clipRef.current[0],
        //     value[1] + diffEnd - clipRef.current[1],
        //   ]);
        //   // 记录本次变化的时间 具体逻辑先了解 getTemplateClip update 方法的逻辑
        //   clipRef.current[0] = diffStart;
        //   clipRef.current[1] = diffEnd;
        //   if (changeType === 'end') {
        //     setCurrentTimeWithThrottle(offsetTime + currentTemp.endTime, false);
        //   }
        // } else {
        //   if (changeType === 'start') {
        //     console.log('currentTime + diffStart', currentTime + diffStart);

        //     setCurrentTimeWithThrottle(offsetTime + diffStart, false);
        //   } else {
        //     setCurrentTimeWithThrottle(
        //       offsetTime + currentTemp.endTime - diffEnd,
        //       false,
        //     );
        //   }
        // }

        // const { startTime, endTime, record, changeType } = info;
        // const { templateIndex } = record;
        // const [templateClip, update] = getTemplateClip(templateIndex);
        // console.log('templateClip', templateClip);
        // const diffEnd = record.endTime - endTime;
        // const diffStart = startTime - record.startTime;

        // const allTemplates = getAllTemplates();
        // const selectedTemp = allTemplates[templateIndex];

        // if (changeType === 'start') {
        //   console.log('currentTime + diffStart', currentTime + diffStart);

        //   setCurrentTimeWithThrottle(currentTime + diffStart, false);
        // } else {
        //   setCurrentTimeWithThrottle(currentTime - diffEnd, false);
        // }

        // const [countTempTime] = allTemplateVideoTime();
        // const allTemplates = getAllTemplates();
        // const selectedTemp = allTemplates[templateIndex];

        // diffEndRef.current = record.endTime - endTime;

        // // if (changeType === 'end') {
        // //   const diffStart = startTime - record.startTime;
        // //   const diffEnd = record.endTime - endTime;

        // //   update([
        // //     templateClip[0] + diffStart - clipRef.current[0],
        // //     templateClip[1] + diffEnd - clipRef.current[1],
        // //   ]);
        // //   // 记录本次变化的时间 具体逻辑先了解 getTemplateClip update 方法的逻辑
        // //   clipRef.current[0] = diffStart;
        // //   clipRef.current[1] = diffEnd;
        // // }

        // const { pageTime } = selectedTemp.videoInfo;
        // const timeScale = getTemplateTimeScale()?.[templateIndex] || [0, 0];
        // const templateStartTime = timeScale[0];
        // const templateEndTime = templateStartTime + pageTime;

        // // TODO: 以下是从主画布搬过来的逻辑，待整理
        // const { scaleTime, scaleWidth, timeLineScale } = timeLinePageStore;
        // const unitWidth = (1000 / scaleTime) * scaleWidth;

        // const range = {
        //   start: {
        //     min: Math.max(
        //       -templateClip[0],
        //       -(templateTotalDurationLimit - countTempTime),
        //     ),
        //     max: selectedTemp.videoInfo.allAnimationTimeBySpeed - 1000,
        //   },
        //   end: {
        //     min: -(selectedTemp.videoInfo.allAnimationTimeBySpeed - 1000),
        //     max: templateTotalDurationLimit - countTempTime,
        //   },
        // };

        // const { speed } = selectedTemp.videoInfo;

        // const handleClip = (d: number, target: 'start' | 'end') => {
        //   let distance = d;
        //   const { min, max } = range[target];
        //   const maxChangDistance = (max / 1000) * unitWidth;
        //   const minChangDistance = (min / 1000) * unitWidth;
        //   if (distance > maxChangDistance) {
        //     distance = maxChangDistance;
        //   } else if (distance < minChangDistance) {
        //     distance = minChangDistance;
        //   }
        //   const changeTime = (distance / unitWidth) * 1000;
        //   const unSpeedChangeTimeSpeed = changeTime / (1 / speed);
        //   let [clipStart, clipEnd] = templateClip;
        //   if (target === 'start') {
        //     clipStart += unSpeedChangeTimeSpeed;
        //   } else {
        //     clipEnd -= unSpeedChangeTimeSpeed;
        //   }
        //   return [clipStart, clipEnd];
        // };

        // if (changeType === 'start') {
        //   const extra = handleClip(
        //     calcTimeToPx(startTime - record.startTime, timeLineScale),
        //     'start',
        //   );
        //   const result = templateStartTime + extra[0];
        //   if (result >= 0) {
        //     setCurrentTimeWithThrottle(result, false);
        //   }
        // } else {
        //   const extra = handleClip(
        //     calcTimeToPx(endTime - record.endTime, timeLineScale),
        //     'end',
        //   );
        //   const result = templateEndTime - extra[1] - 10;
        //   if (result < templateEndTime) {
        //     setCurrentTimeWithThrottle(
        //       Math.min(templateEndTime - extra[1], templateEndTime),
        //       false,
        //     );
        //   }
        // }
      },
      onTimeChangeEnd: info => {
        // 如果已经自动伸缩过，则不再改变时间
        const { startTime, endTime, record, changeType } = info;

        // if (changeType === 'start' && startTime === 0) {
        //   message.info('模板已经拖到头了');
        //   return;
        // }

        clickActionWeblog('Timeline9');

        const { templateIndex } = record;
        const diffStart = startTime - record.startTime;
        const diffEnd = record.endTime - endTime;

        const [value, update] = getTemplateClip(templateIndex);

        update([value[0] + diffStart, value[1] + diffEnd]);

        if (changeType === 'start') {
          const { templates } = timeLinePageStore;
          const currentTemp = templates[templateIndex];
          const { offsetTime } = currentTemp;
          setCurrentTimeWithThrottle(offsetTime, false);
        }
      },
      onMouseUp: () => {
        // const { setAutoScale } = timeLinePageStore;
        clearInterval(timer.current);
        setHiddenPointer(false);
        // setAutoScale();
      },
      trackTypes: bgTrackTypes,
    };
  }, [scrollEle]);

  return timelineOptions;
};
