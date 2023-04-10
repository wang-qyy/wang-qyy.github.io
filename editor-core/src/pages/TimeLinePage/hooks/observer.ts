import { autorun } from 'mobx';
import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  getAllAudios,
  getAllTemplates,
  isTempModuleType,
  useAllTemplateVideoTimeByObserver as allTemplateVideoTime,
  useVideoClipByObserver as getVideoClipByObserver,
  useVideoHandler,
} from '@/kernel';
import { TimeLineData, TimeLineItem } from '@/components/TimeLine/types';
import {
  TEMPLATE_MIN_DURATION,
  TEMPLATE_MIN_DURATION_TRANSFER,
} from '@/config/basicVariable';
import { createId } from '@/utils/single';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import { calcTimeToPx } from '@/components/TimeLine';
import timeLinePageStore, { Template } from '../store';
import { emptyBgType, partTimeLimit } from '../options';
import { isBackground } from '../utils';

// 监听播放时间
export const useObserverCurrentTime = () => {
  const { setCurrentTime, currentTime } = useVideoHandler();
  const { activePartKey, durationInfo, maxDuration, hiddenPointer } =
    timeLinePageStore;
  const { offsetTime, countDuration } = durationInfo;

  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();

  // 选择片段变化时 重置 currentTime 的起始时间
  useEffect(() => {
    activePartKey && setCurrentTime(offsetTime);
  }, [activePartKey, offsetTime]);

  // 播放时长超过当前总片段时长时，重置 currentTime 的起始时间
  useLayoutEffect(() => {
    if (currentTime - offsetTime > countDuration && isPlaying) {
      setCurrentTime(offsetTime);
    }
  }, [currentTime, offsetTime, countDuration]);
};

// 监听外面传入的partKey
export const useObserverPartKey = (partKey: number) => {
  useEffect(() => {
    const { setActivePartKey } = timeLinePageStore;
    setActivePartKey(partKey);
  }, [partKey]);
};

// 把模板数据同步到时间轴中
export const useObserverTemplates = () => {
  const trackIdRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const dispose = autorun(() => {
      const { setTemplates, timeLineScale } = timeLinePageStore;
      const temps = getAllTemplates();
      let offsetTime = 0; // 当前片段相对于整体的偏移时间

      const assetTemps: Template[] = [];

      const [countTempTime] = allTemplateVideoTime();

      temps.forEach((temp, i) => {
        const { speed } = temp.videoInfo;
        // 普通元素
        const assets: TimeLineData = [];
        // 背景元素
        const bgAssets: TimeLineData = [];

        const sortAssets = [...temp.assets]
          .filter(
            t =>
              !isTempModuleType(t) &&
              !t.meta.isTransfer &&
              !t.meta.isLogo &&
              !t.meta.hidden &&
              !(t.meta.type === 'effect'),
          )
          .sort((a, b) => b.asset.transform.zindex - a.asset.transform.zindex);

        sortAssets.forEach(asset => {
          const {
            assetDurationWithOffset,
            minAssetDuration,
            attribute: { rt_total_time },
          } = asset;
          const { trackId, type } = asset.meta;

          const assetObj: TimeLineItem = {
            id: asset.id,
            startTime: assetDurationWithOffset.startTime,
            endTime: assetDurationWithOffset.endTime,
            trackId: trackId || trackIdRef.current[asset.id] || createId(),
            asset,
            type,
            disableDrag: asset.meta.locked,
            templateId: temp.id,
            templateIndex: i,
            minDuration: minAssetDuration,
            maxEndTime: temp.videoInfo.allAnimationTime,
          };

          // 视频元素需要限制可拉伸时长
          if (['video', 'videoE'].includes(type)) {
            const { value } = getVideoClipByObserver(asset); // 视频裁剪

            assetObj.minStartTime =
              assetDurationWithOffset.startTime - value.startTime;
            assetObj.maxEndTime = Math.min(
              assetDurationWithOffset.endTime +
                Number(rt_total_time) -
                value.endTime,
              temp.videoInfo.allAnimationTime,
            );
          }

          if (isBackground(asset)) {
            bgAssets.push({
              ...assetObj,
              minDuration:
                temp.startTransfer || temp.endTransfer
                  ? TEMPLATE_MIN_DURATION_TRANSFER
                  : TEMPLATE_MIN_DURATION,
              minStartTime: -temp.videoInfo.offsetTime[0],
              isBackground: true,
              disableDrag: true,
              maxEndTime:
                temp.videoInfo.allAnimationTime +
                (partTimeLimit - countTempTime),
            });
            return;
          }

          // 缓存没有trackId元素的trackId，当下次更新仍然没有trackId的话就取缓存中的trackId
          if (!trackIdRef.current[asset.id]) {
            trackIdRef.current[asset.id] = assetObj.trackId;
          }
          assets.push(assetObj);
        });

        // 如果没有背景元素 则新建一个空的背景元素
        if (!bgAssets.length) {
          bgAssets.push({
            id: createId(),
            startTime: 0,
            endTime: temp.videoInfo.allAnimationTime,
            trackId: createId(),
            minDuration:
              temp.startTransfer || temp.endTransfer
                ? TEMPLATE_MIN_DURATION_TRANSFER
                : TEMPLATE_MIN_DURATION,

            // asset,
            template: temp,
            type: emptyBgType,
            templateId: temp.id,
            templateIndex: i,
            isBackground: true,
            disableDrag: true,
            minStartTime: -temp.videoInfo.offsetTime[0],
            maxEndTime:
              temp.videoInfo.allAnimationTime + (partTimeLimit - countTempTime),
          });
        }

        assetTemps.push({
          endTime: temp.videoInfo.allAnimationTimeBySpeed,
          id: temp.id,
          assets,
          bgAssets,
          cameras: temp.cameras,
          scale: speed,
          offsetTime,
          width: calcTimeToPx(
            temp.videoInfo.allAnimationTimeBySpeed,
            timeLineScale,
          ),
          paddingLeft: 0,
          paddingRight: 0,
        });

        offsetTime += temp.videoInfo.allAnimationTimeBySpeed;
      });
      setTemplates(assetTemps);
    });
    return dispose;
  }, []);
};

// 把音频数据同步到时间轴中
export const useObserverAudios = () => {
  useEffect(() => {
    const dispose = autorun(() => {
      const { setAudioList } = timeLinePageStore;
      const audios = getAllAudios();
      const audioAssets = audios.map(audio => ({
        id: audio.resId,
        startTime: audio.startTime,
        endTime: audio.endTime,
        trackId: audio.resId,
        asset: audio,
        type: 'audio',
      }));
      setAudioList(audioAssets);
    });
    return dispose;
  }, []);
};

// /**
//  * @description 操作历史记录
//  */
// export function useHistoryByObserver() {
//   const { hasNext, hasPrev } = historyStore;

//   function resetData(data: RecordData) {
//     const { templates, audios } = data;
//     assetBlur();
//     assetHandler.restoreAllTemplate(templates);
//     audioHandler.setAudios(audios);
//   }

//   function goNext() {
//     const data = historyStore.goNext();
//     if (data) {
//       resetData(data);
//     }
//   }

//   function goPrev() {
//     const data = historyStore.goPrev();
//     if (data) {
//       resetData(data);
//     }
//   }

//   return {
//     value: {
//       hasNext,
//       hasPrev,
//     },
//     goNext,
//     goPrev,
//   };
// }
