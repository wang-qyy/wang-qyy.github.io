import { ReactText, useCallback, useEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';

import { useScroll, useSize } from 'ahooks';
import TimeLine, { calcTimeToPx } from '@/components/TimeLine';
import {
  getCarmeraStatus,
  getCurrentAsset,
  setCurrentTimeWithThrottle,
  useVideoHandler,
} from '@/kernel';
import { Audios } from '@/CommonModule/Audios';

import Cameras from '@/components/TimeLine/components/Cameras';
import timeLinePageStore, { Template } from '../../store';
import Mark from '../Mark';
import { useObserverCurrentTime } from '../../hooks/observer';
import styles from './index.less';
import { useAssetTimelineOptions, useBgTimelineOptions } from './hooks';
import { paddingLeft } from '../../options';

const TimeLineCom = () => {
  // const { onHeightChange } = props;
  const {
    scaleTime,
    scaleWidth,
    selectedTemplates,
    setRulerWidth,
    timeLineScale,
    audioList,
    activePartKey,
    durationInfo,
    canvasHeight,
    hiddenPointer,
  } = timeLinePageStore;

  const rulerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // const scrollXRef = useRef<HTMLDivElement>(null);
  // const scrollYRef = useRef<HTMLDivElement>(null);
  const bgContentRef = useRef<HTMLDivElement>(null);
  const assetContentRef = useRef<HTMLDivElement>(null);
  const camerasRef = useRef<HTMLDivElement>(null);

  const scrollInfo = useScroll(scrollRef);

  const rulerSize = useSize(rulerRef);
  const scrollWrapperSize = useSize(scrollRef);
  const bgSize = useSize(bgContentRef);
  const assetsSize = useSize(assetContentRef);
  const { currentTime } = useVideoHandler();
  const inCamera = getCarmeraStatus();
  // const [top, _top] = useState(1000);

  useEffect(() => {
    setRulerWidth(rulerSize.width || 2000);
  }, [rulerSize.width, setRulerWidth]);

  useObserverCurrentTime();

  const assetTimelineOptions = useAssetTimelineOptions();
  const bgTimelineOptions = useBgTimelineOptions(scrollRef.current);

  const formatter = useCallback(
    (v: number) => {
      const value = (v / 1000) * scaleTime;
      if (!value || value / window.parseInt(`${value}`) === 1)
        return `${value}s`; // 整数
      // return `${value}s`;
      return `${value.toFixed(1)}s`;
    },
    [scaleTime],
  );

  const audioDuration = Math.max(...audioList.map(t => t.endTime));

  const setRelativeTime = useCallback(
    (time: number) => {
      setCurrentTimeWithThrottle(time + durationInfo.offsetTime, false);
      // setCurrentTime(time + durationInfo.offsetTime);
    },
    [durationInfo.offsetTime],
  );

  const top = useMemo(() => {
    return (bgContentRef.current?.offsetTop ?? 0) - scrollInfo.top;
  }, [
    scrollWrapperSize.height,
    bgContentRef.current,
    activePartKey,
    bgSize.height,
    assetsSize.height,
    canvasHeight,
    scrollInfo.top,
  ]);

  const getSelectKeys = (templateId: ReactText) => {
    const activeAsset = getCurrentAsset();
    // 多选
    if (activeAsset?.meta.type === '__module') {
      if (activeAsset.assets?.[0]?.template?.id !== templateId) return [];
      return activeAsset.assets.map(t => t.id);
    }
    if (activeAsset?.template?.id !== templateId) return [];
    return [activeAsset.id];
  };
  return (
    <div className={styles.timeLineWrapper}>
      <Mark top={top} />
      <div className={styles.timeLineBody}>
        <TimeLine
          scaleTime={scaleTime}
          scaleWidth={scaleWidth}
          paddingLeft={paddingLeft}
        >
          {/** 指针 */}
          <TimeLine.Pointer
            currentTime={currentTime - durationInfo.offsetTime}
            scrollLeft={scrollInfo.left || 0}
            maxDuration={durationInfo.countDuration}
            onTimeChange={setRelativeTime}
            hidden={hiddenPointer}
          />
          {/** 尺标 */}
          <div ref={rulerRef} className={styles.ruler}>
            <TimeLine.Ruler
              width={rulerSize?.width || 0}
              height={rulerSize?.height || 0}
              scaleWidth={scaleWidth}
              formatter={formatter}
              offsetLeft={scrollInfo?.left || 0}
              labelInterval={~~Math.max(5, 100 / scaleTime)}
              scaleHeight={12}
              fontOffsetY={12}
              textBaseline="top"
              fontColor="#484E5F"
              scaleColor="#CDD5DE"
              textAlign="center"
            />
          </div>
          <div
            ref={scrollRef}
            className={styles.timeLines}
            style={{ paddingLeft }}
          >
            {/* 镜头 */}
            {inCamera && (
              <div className={styles.cameras} ref={camerasRef}>
                {selectedTemplates.map((temp, index) => (
                  <Cameras
                    template={temp}
                    data={[]}
                    key={temp.id}
                    scale={temp.scale}
                    selectKeys={[]}
                    options={bgTimelineOptions}
                    scroll={{ ...scrollInfo }}
                    // width={temp.width}
                    duration={temp.endTime}
                    style={{
                      paddingLeft: temp.paddingLeft,
                      paddingRight: temp.paddingRight,
                    }}
                  />
                ))}
              </div>
            )}
            <div ref={assetContentRef} className={styles.assetTimeLine}>
              {/** 元素 */}
              <div className={styles.parts}>
                {selectedTemplates.map(temp => (
                  <TimeLine.Item
                    data={temp.assets}
                    className={styles.assetTimeLineItem}
                    key={temp.id}
                    scale={temp.scale}
                    selectKeys={getSelectKeys(temp.id)}
                    options={assetTimelineOptions}
                    scroll={{ ...scrollInfo }}
                    // width={temp.width}
                    duration={temp.endTime}
                    style={{
                      paddingLeft: temp.paddingLeft,
                      paddingRight: temp.paddingRight,
                    }}
                  />
                ))}
              </div>
            </div>
            {/** 背景 */}
            <div className={styles.bgs} ref={bgContentRef}>
              {selectedTemplates.map(temp => (
                <TimeLine.Item
                  data={temp.bgAssets}
                  key={temp.id}
                  scale={temp.scale}
                  selectKeys={[]}
                  options={bgTimelineOptions}
                  scroll={{ ...scrollInfo }}
                  // width={temp.width}
                  duration={temp.endTime}
                  style={{
                    paddingLeft: temp.paddingLeft,
                    paddingRight: temp.paddingRight,
                  }}
                />
              ))}
            </div>
            {/** 音乐 当选择全部片段时展示 */}
            {activePartKey === -1 && (
              <div
                className={styles.audios}
                style={{
                  width: calcTimeToPx(audioDuration, timeLineScale),
                }}
              >
                <Audios
                  wrapClassName="xiudodo-bottom-audios-wrap"
                  className="xiudodo-bottom-audios"
                  autoScroll={false}
                  style={{ width: calcTimeToPx(audioDuration, timeLineScale) }}
                />
              </div>
            )}
          </div>
        </TimeLine>
      </div>
      <div style={{ width: 20 }} />
    </div>
  );
};

export default observer(TimeLineCom);
