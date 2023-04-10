import { useRef, PropsWithChildren, useMemo } from 'react';
import { message, Modal } from 'antd';
import classNames from 'classnames';
import {
  useAssetAeAByObserver,
  observer,
  useGetCurrentAsset,
  canSetTextAnimation,
} from '@hc/editor-core';

import AutoDestroyVideo from '@/components/AutoDestroyVideo';

import './index.less';

type AnimationType = 'in' | 'out' | 'stay' | 'inout';

export interface AnimationItem {
  icon_url: string;
  small_url: string;
  in_gid: string;
  in_id: number;
  out_gid: string;
  out_id: number;
  title: string;
}

export interface AnimationClassify {
  name: string;
  type: AnimationType;
  items: AnimationItem[];
}

interface EffectsProps {
  type: AnimationType;
  data: AnimationClassify[];
  selected?: number;
  onChange?: (animation?: AnimationItem) => void;
  onHover?: (animation?: AnimationItem) => void; // 鼠标hover预览效果
  speed?: number;
}

export const animationType: any = {
  in: 'i',
  out: 'o',
  stay: 's',
  inout: 'o&i',
};

const Effects = ({
  type,
  data,
  selected,
  onChange,
  speed = 1,
}: PropsWithChildren<EffectsProps>) => {
  const timer = useRef(null);
  const asset = useGetCurrentAsset();
  const { update, preview, previewEnd, clear, assetAeaDuration } =
    useAssetAeAByObserver();

  function setAnimationPreview(animation: any) {
    if (type === 'inout') {
      preview('i', animation.in_id, speed);
      timer.current = setTimeout(() => {
        previewEnd();
        setTimeout(() => {
          preview('o', animation.out_id, speed);
        }, 50);
      }, 1500);
    } else {
      preview(animationType[type], animation[`${type}_id`], speed);
    }
  }
  function setAssetAnimation(animation: any) {
    if (type === 'inout') {
      update('i', animation.in_id);
      setTimeout(() => {
        update('o', animation.out_id);
      }, 400);
    } else {
      update(animationType[type], animation[`${type}_id`]);
    }
    message.success('动画设置成功！');
  }

  function setAnimation(animation: any) {
    if (asset?.attribute?.stayEffect) {
      Modal.confirm({
        title: '确定要清空停留动画吗？',
        content: '停留动效无法与入场动画/出场动画同时存在！',
        okText: '确认',
        cancelText: '我再想想',
        onOk: () => {
          setAssetAnimation(animation);
        },
      });
    } else {
      setAssetAnimation(animation);
    }
  }

  const { textAni, assetAni } = useMemo(() => {
    const textIndex = data.findIndex(item => item.name === '文字');
    const textAni = data[textIndex];
    const assetAni = [...data];
    assetAni.splice(textIndex, 1);
    return {
      textAni,
      assetAni,
    };
  }, [data]);

  const showTextAni = useMemo(() => {
    return canSetTextAnimation(asset);
  }, [asset]);
  const effectItem = (item: AnimationClassify) => {
    return (
      <div key={`kind-${item.name}`}>
        <div className="animation-classify-name">{item.name}</div>

        {item.items.map(animation => (
          <div
            key={`${animation.in_id || animation.out_id}`}
            className={classNames('animation-item', {
              'animation-item-selected':
                String(selected) === String(animation[`${type}_id`]),
            })}
            onMouseEnter={() => setAnimationPreview(animation)}
            onMouseLeave={() => {
              clearTimeout(timer.current);
              previewEnd();
            }}
            onClick={() => {
              onChange && onChange();
              setAnimation(animation);
              setAnimationPreview(animation);
            }}
          >
            <AutoDestroyVideo
              poster={animation.icon_url}
              src={animation.small_url}
            />
            {/* <img src={animation.icon_url} alt="animation" /> */}

            <div className="animation-title">{animation.title}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animation-list">
      {showTextAni && effectItem(textAni)}
      {assetAni.map(item => effectItem(item))}
    </div>
  );
};

export default observer(Effects);
