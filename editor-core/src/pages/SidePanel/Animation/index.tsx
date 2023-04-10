import {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent,
} from 'react';
import { Radio, RadioChangeEvent, Popover, Modal, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useRequest, useInViewport, useSize } from 'ahooks';
import classNames from 'classnames';
import {
  observer,
  useAssetAeAByObserver,
  AeAItem,
  getCurrentTemplate,
  calcAeATimeToPbr,
  useGetCurrentAsset,
  AssetClass,
  AeA,
} from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';

import { getAnimationListV5 } from '@/api/text';

import SidePanelWrap from '@/components/SidePanelWrap';

import { mouseMoveDistance } from '@/utils/single';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';
import AnimationList, { AnimationClassify, AnimationItem } from './Options';

import './index.less';

export type AeaItemKey = keyof AeA;

interface AnimationProps {
  type: 'in' | 'out';
  title: string;
  value?: AeAItem;
  options?: AnimationClassify[];
}
export const animationType: any = {
  in: 'i',
  out: 'o',
  stay: 's',
  inout: 'o&i',
};

function TimeSlider({
  onChange,
  aeaKey,
  asset,
  max,
}: {
  onChange: (value: number) => void;
  aeaKey: AeaItemKey;
  asset: AssetClass;
  max: number;
}) {
  const { startTime, endTime } = asset.assetDuration;

  const time = asset.animationItemDuration[aeaKey];

  const assetTime = endTime - startTime;

  const sliderRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useSize(sliderRef);

  function handleChange(e: MouseEvent<HTMLDivElement>) {
    mouseMoveDistance(e, x => {
      const changeTime = (x / width) * assetTime;
      console.log('mouseMoveDistance', time + changeTime);

      onChange(time + changeTime);
    });
  }

  return (
    <div ref={sliderRef} className="animation-time-slider">
      <div
        className="animation-time-slider-rail"
        style={{ width: `${(max / assetTime) * 100}%` }}
      />
      <div
        className="animation-time-slider-track"
        style={{ width: `${(time / assetTime) * 100}%` }}
      />
      <div
        className="animation-time-slider-handle"
        onMouseDown={handleChange}
        style={{ left: `${(time / assetTime) * 100}%` }}
      />
    </div>
  );
}

const Animation = observer(
  ({ type, title, options, value }: PropsWithChildren<AnimationProps>) => {
    const [optionsVisible, setOptionsVisible] = useState(false);

    const currentAsset = useGetCurrentAsset();

    const [isPreview, setIsPreview] = useState(false);
    const aeaKey = animationType[type];

    const {
      update,
      preview,
      previewEnd,
      clear,
      updatePbr,
      inPreview,
      assetAeaDuration,
      max,
    } = useAssetAeAByObserver();
    const animationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!inPreview) {
        setIsPreview(false);
      }
    }, [inPreview]);

    const animation = useMemo(() => {
      let temp: AnimationItem;
      if (value?.resId) {
        options?.forEach(item => {
          item.items.forEach(animationItem => {
            if (String(animationItem[`${type}_id`]) === String(value.resId)) {
              temp = {
                ...animationItem,
                title: animationItem.title + item.name,
              };
            }
          });
        });
      }
      return temp;
    }, [value?.resId, options]);

    function setAnimationPreview(speed = 1) {
      if (value?.resId) {
        preview(aeaKey, value.resId, speed);
      }
    }

    // 设置动画速度
    function setAnimationSpeed(e: RadioChangeEvent) {
      updatePbr(aeaKey, e.target.value);

      previewEnd();
      setAnimationPreview(e.target.value);
    }

    const inViewPort = useInViewport(animationRef);

    useEffect(() => {
      if (!inViewPort) {
        setOptionsVisible(false);
      }
    }, [inViewPort]);

    const aeaDuration = assetAeaDuration?.[aeaKey];

    return (
      <div className="animation-selected" ref={animationRef}>
        <div className="animation-type">
          <span>{title}</span>
          <span
            hidden={!value?.resId}
            className="animation-preview"
            onClick={() => {
              if (inPreview) {
                previewEnd();
              } else {
                setIsPreview(true);
                setAnimationPreview();
              }
            }}
          >
            {isPreview ? '停止' : '预览'}
          </span>
        </div>

        <div style={{ backgroundColor: '#fff', padding: 8, borderRadius: 4 }}>
          <Popover
            visible={optionsVisible}
            onVisibleChange={v => {
              if (!v) {
                setOptionsVisible(v);
              }
            }}
            trigger="click"
            placement="bottom"
            overlayClassName={classNames('animation-options-popover', {
              'animation-options-out': type === 'out',
            })}
            getPopupContainer={() =>
              document.getElementById('xiudodo') as HTMLDivElement
            }
            content={
              <>
                {options && (
                  <AnimationList
                    type={type}
                    data={options}
                    selected={Number(value?.resId)}
                    speed={value?.pbr}
                    onChange={() => {
                      setOptionsVisible(false);
                    }}
                  />
                )}
                <div className="asset-clear-animation" hidden={!value?.resId}>
                  <Button
                    onClick={() => {
                      clear(aeaKey);
                      setOptionsVisible(false);
                    }}
                  >
                    移除动画
                  </Button>
                </div>
              </>
            }
          >
            {animation ? (
              <div
                className="animation-detail"
                onClick={() => setOptionsVisible(true)}
                style={{ position: 'relative' }}
              >
                <img
                  width={60}
                  src={animation.icon_url}
                  alt={animation.title}
                  style={{ borderRadius: 4 }}
                />
                <div style={{ flex: 1, marginLeft: 16 }}>{animation.title}</div>
                <RightOutlined
                  className={classNames({
                    'open-animation-popover': optionsVisible,
                  })}
                />
              </div>
            ) : (
              <div
                className="animation-add"
                onClick={() => {
                  const pageTime =
                    getCurrentTemplate().videoInfo.allAnimationTime;

                  if (pageTime <= 1000) {
                    Modal.info({
                      content: (
                        <span>
                          当前片段时长过短，无法设置动画。
                          若要设置动画，需将当前片段时长调至大于1秒。
                        </span>
                      ),
                      okText: '知道了',
                    });
                    return;
                  }
                  setOptionsVisible(true);
                }}
              >
                <div className="animation-add-icon">
                  <XiuIcon type="iconxingzhuangjiehe6" />
                </div>
                添加动画
              </div>
            )}
          </Popover>

          {animation && (
            <div className="animation-speed">
              <div className="animation-speed-label">持续</div>

              {currentAsset && max && value && (
                <TimeSlider
                  onChange={time => {
                    const maxTime = max[aeaKey];
                    if (time < 100) {
                      time = 100;
                    }
                    if (time > maxTime) {
                      time = maxTime;
                    }
                    const pbr = calcAeATimeToPbr(time, value.kw);
                    updatePbr(aeaKey, pbr);
                  }}
                  aeaKey={aeaKey}
                  asset={currentAsset}
                  max={max[aeaKey]}
                />
              )}
              <div className="animation-time">
                {(aeaDuration / 1000).toFixed(2)}s
              </div>

              {/* <Radio.Group
                onChange={setAnimationSpeed}
                value={value?.pbr}
                style={{ color: '#262E48' }}
              >
                <Radio value={0.5}>缓慢</Radio>
                <Radio value={1}>正常</Radio>
                <Radio value={1.5}>较快</Radio>
              </Radio.Group> */}
            </div>
          )}
        </div>
      </div>
    );
  },
);

function AnimationWrap() {
  const { close } = useSettingPanelInfo();

  const { value } = useAssetAeAByObserver();

  const { data } = useRequest(getAnimationListV5, {
    formatResult: res => {
      const result = { inout: [], in: [], out: [] };
      res.data.forEach((item: { type: 'inout' | 'in' | 'out'; items: [] }) => {
        result[item.type] = item.items;
      });

      return result;
    },
  });

  return (
    <SidePanelWrap
      header="动画设置"
      onCancel={close}
      wrapClassName="side-setting-panel animation-control-panel"
    >
      <Animation
        title="入场动画"
        type="in"
        value={value?.i}
        options={data?.in}
      />
      <Animation
        title="出场动画"
        type="out"
        value={value?.o}
        options={data?.out}
      />

      <div style={{ color: '#9398aa' }}>出入场总时间不超过元素出现时间</div>
    </SidePanelWrap>
  );
}

export default observer(AnimationWrap);
