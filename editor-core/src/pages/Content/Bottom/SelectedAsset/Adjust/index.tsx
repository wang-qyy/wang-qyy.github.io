import { useMemo, useEffect, useRef, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { message } from 'antd';

import {
  getCurrentTemplateIndex,
  useVideoClipByObserver,
  useAssetDurationByOffsetTime,
  observer,
  AssetClass,
  TemplateClass,
  setTempPreviewCurrentTime,
  getRelativeCurrentTime,
} from '@hc/editor-core';
import { XiuIcon } from '@/components';
import { getLocalStorage, setLocalstorageExtendStorage } from '@/utils/single';
import { storageNovice } from '@/utils/guide';
import { TrimDurationGuide } from '@/pages/Help/Guide/variable';
import { useGuideInfo } from '@/store/adapter/useGlobalStatus';
import { Rail, Track } from '@/components/Axis';
import { clickActionWeblog } from '@/utils/webLog';

import Image from '../Image';
import Text from '../Text';
import SvgPath from '../SvgPath';
import Module from '../Module';
import { useGetUnitWidth } from '../../handler';

import styles from './index.modules.less';

type TargetType = 'start' | 'end' | 'center';

interface AdjustProps {
  setAuxiliaryLine: (auxiliaryLine: 'start' | 'end' | '') => void;
  asset: AssetClass;
  template: TemplateClass;
}

function Adjust(props: PropsWithChildren<AdjustProps>) {
  const { setAuxiliaryLine, asset, template } = props;

  // console.log(toJS(currentAsset));
  const assetRef = useRef<HTMLDivElement>(null);
  const currentAsset =
    asset?.meta.type === 'mask' && asset.assets?.length
      ? asset.assets[0]
      : asset;

  const {
    value,
    update,
    min: assetMinDuration,
  } = useAssetDurationByOffsetTime(template); // 视频出现时长

  const { value: clipValue, update: setVideoClipTime } =
    useVideoClipByObserver(); // 视频裁剪

  const unitWidth = useGetUnitWidth();

  const videoTotalTime = template?.videoInfo.allAnimationTimeBySpeed || 0;

  // 选中时自动进入可视区
  useEffect(() => {
    assetRef.current?.scrollIntoViewIfNeeded(true);
  }, []);

  const canClip =
    !currentAsset?.attribute.isLoop && currentAsset?.meta.type === 'videoE';

  // 视频资源时长
  const getAssetDuration = () => {
    return currentAsset?.attribute.rt_total_time ?? 0;
  };

  // 视频裁剪数据
  const videoClip = useMemo(() => {
    const { startTime, endTime } = value;

    const { startTime: clipStartTime, endTime: clipEndTime } = clipValue;
    const videoDuration = getAssetDuration();

    if (clipStartTime < 0 && clipEndTime < 0) {
      return {
        startTime: 0,
        endTime: Math.min(endTime - startTime, videoDuration),
      };
    }

    return clipValue;
  }, [clipValue.startTime, clipValue.endTime, currentAsset?.meta.id]);

  // 裁剪限制
  const assetLimit = useMemo(() => {
    const { startTime, endTime } = value;

    const limit = {
      start: {
        min: -startTime,
        max: endTime - startTime - assetMinDuration,
      },
      end: {
        min: -(endTime - startTime - assetMinDuration),
        max: videoTotalTime - endTime,
      },
      center: {
        min: -startTime,
        max: videoTotalTime - endTime,
      },
    };

    if (canClip) {
      const { startTime: clipStartTime, endTime: clipEndTime } = videoClip;
      const videoDuration = getAssetDuration();

      limit.start.min = Math.max(limit.start.min, -clipStartTime);
      limit.end.max = Math.min(limit.end.max, videoDuration - clipEndTime);
    }

    return limit;
  }, [
    value.startTime,
    value.endTime,
    videoClip.startTime,
    videoClip.endTime,
    assetMinDuration,
  ]);

  function getChangeTime(target: TargetType, changeTime: number) {
    const { max, min } = assetLimit[target];

    const { startTime, endTime } = value;

    const inhaleRange = (10 / unitWidth) * 1000;

    const currentTime = getRelativeCurrentTime();

    let nearStart;

    let nearEnd;

    if (target === 'start') {
      nearStart = currentTime - startTime;
    } else if (target === 'end') {
      nearEnd = currentTime - endTime;
    } else {
      nearStart = currentTime - startTime;
      nearEnd = currentTime - endTime;
    }

    if (nearStart !== undefined && nearStart > min && nearStart < max) {
      if (Math.abs(nearStart - changeTime) < inhaleRange) {
        return nearStart;
      }
    }

    if (nearEnd !== undefined && nearEnd > min && nearEnd < max) {
      if (Math.abs(nearEnd - changeTime) < inhaleRange) {
        return nearEnd;
      }
    }

    if (changeTime > max) {
      return max;
    }
    if (changeTime < min) {
      return min;
    }

    return changeTime;
  }

  // 视频裁剪
  const handleVideoClip = ({ changeTime }, target: TargetType) => {
    let { startTime, endTime } = value;

    let { startTime: clipStartTime, endTime: clipEndTime } = videoClip;

    changeTime = getChangeTime(target, changeTime);

    // const { max, min } = assetLimit[target];

    // if (changeTime > max) {
    //   changeTime = max;
    // } else if (changeTime < min) {
    //   changeTime = min;
    // }

    if (target === 'start') {
      startTime += changeTime;
      clipStartTime += changeTime;
    } else if (target === 'end') {
      endTime += changeTime;

      clipEndTime = Math.min(
        clipStartTime + (endTime - startTime),
        getAssetDuration(),
      );
    } else {
      startTime += changeTime;
      endTime += changeTime;
    }

    // 辅助线
    if (endTime >= videoTotalTime && ['end', 'center'].includes(target)) {
      setAuxiliaryLine('end');
    } else if (startTime <= 0 && ['start', 'center'].includes(target)) {
      setAuxiliaryLine('start');
    } else {
      setAuxiliaryLine('');
    }

    const result = {
      duration: { startTime, endTime },
    };

    if (target !== 'center' && canClip) {
      Object.assign(result, {
        videoClip: { startTime: clipStartTime, endTime: clipEndTime },
      });
    }

    const templateIndex = getCurrentTemplateIndex();
    if (templateIndex > -1) {
      if (['start', 'center'].includes(target)) {
        setTempPreviewCurrentTime({
          templateIndex,
          currentTime: startTime + 10,
        });
      } else {
        setTempPreviewCurrentTime({
          templateIndex,
          currentTime: endTime - 10,
        });
      }
    }

    if (result?.duration) {
      update(result.duration);
    }
    if (result?.videoClip) {
      setVideoClipTime(result.videoClip);
    }

    return result;
  };

  function onFinish({ extra }) {
    if (extra) {
      const { startTime, endTime } = extra.duration;

      if (endTime - startTime <= assetMinDuration) {
        message.info('已调整到最短出现时长');
      }
    }

    setAuxiliaryLine('');
    clickActionWeblog('updateAssetDuration');
    setTempPreviewCurrentTime(undefined);
  }

  function getLoopTimes() {
    const { startTime, endTime } = value;
    const { startTime: clipStartTime, endTime: clipEndTime } = videoClip;

    return Math.ceil((endTime - startTime) / (clipEndTime - clipStartTime));
  }

  const { open: openAssetHandlerGuide, close } = useGuideInfo();

  useEffect(() => {
    if (currentAsset) {
      const { assetGuide } = getLocalStorage('guide');
      if (!assetGuide) {
        storageNovice();
        openAssetHandlerGuide(TrimDurationGuide);
        setLocalstorageExtendStorage('guide', { assetGuide: true });
      }
    }
  }, []);

  function renderSelectedAsset() {
    let dom = <></>;

    if (currentAsset) {
      const tempAsset =
        currentAsset.meta.type === 'mask' && currentAsset.assets?.length
          ? currentAsset.assets[0]
          : currentAsset;

      const {
        picUrl,
        rt_preview_url,
        rt_url,
        rt_frame_file,
        width,
        height,
        SVGUrl,
        rt_svgString,
      } = tempAsset.attribute;
      const { type, shapeType, isOverlay } = tempAsset.meta;

      const loopTimes = canClip ? 1 : getLoopTimes() || 1;

      switch (type) {
        case 'image':
        case 'pic':
          dom = <Image src={picUrl} />;
          break;
        case 'svgPath':
          dom = <SvgPath shapeType={shapeType} />;
          break;
        case 'SVG':
        case 'mask':
          dom = <Image src={rt_preview_url || SVGUrl} />;
          break;
        case 'lottie':
          dom = <Image src={rt_preview_url} />;
          break;
        case 'video':
        case 'videoE':
          return (
            <>
              <Track
                startTime={value.startTime}
                endTime={value.endTime}
                duration={videoTotalTime}
                onChange={handleVideoClip}
                overlayClassName={styles['axis-track-overlay']}
                durationTooltip={false}
                onFinish={onFinish}
              >
                {isOverlay && (
                  <div className={styles['axis-track-video-overlay']}>
                    <XiuIcon type="texiao-6hf9cnel" className={styles.icon} />
                    {asset?.meta?.name || '视频特效'}
                  </div>
                )}
              </Track>

              {!isOverlay && (
                <div className={styles['video-frame-wrap']}>
                  <Rail
                    assetUrl={
                      rt_url && rt_url.indexOf('.webm') > -1
                        ? rt_frame_file
                        : rt_url
                    }
                    assetDuation={getAssetDuration()}
                    assetWidth={width}
                    assetHeight={height}
                    loopTimes={loopTimes}
                    style={{
                      width:
                        (getAssetDuration() / 1000) * unitWidth * loopTimes,
                      left: `${Math.floor(
                        (value.startTime / videoTotalTime -
                          clipValue.startTime / videoTotalTime) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              )}
            </>
          );
        case 'module':
          dom = <Module />;
          break;

        default:
          dom = <Text text={currentAsset?.attribute.text} />;
          break;
      }
      return (
        <Track
          startTime={value.startTime}
          endTime={value.endTime}
          duration={videoTotalTime}
          onChange={handleVideoClip}
          overlayClassName={classNames(styles['axis-track-overlay'], {
            [styles['axis-track-module']]: type === 'module',
            [styles['axis-track-text']]: type === 'text',
            [styles['axis-track-element']]: !['text', 'module'].includes(type),
          })}
          durationTooltip={false}
          onFinish={onFinish}
        >
          {dom}

          <div className={styles.assetAea}>
            <div className={styles['assetAea-i']}>
              {!!asset.animationItemDuration.i && (
                <>
                  <div className={styles['assetAea-line']} />
                  <XiuIcon
                    type="iconbofang"
                    className={styles['assetAea-icon']}
                  />
                </>
              )}
            </div>
            <div className={styles['assetAea-o']}>
              {!!asset.animationItemDuration.o && (
                <>
                  <XiuIcon
                    type="iconbofang"
                    className={styles['assetAea-icon']}
                  />
                  <div className={styles['assetAea-line']} />
                </>
              )}
            </div>
          </div>
        </Track>
      );
    }
  }

  return (
    <div ref={assetRef} className={styles['operate-bar']}>
      {renderSelectedAsset()}
    </div>
  );
}

export default observer(Adjust);
