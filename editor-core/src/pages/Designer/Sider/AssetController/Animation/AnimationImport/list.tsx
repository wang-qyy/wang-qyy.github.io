import { deleteAnimation, getMyAnimation } from '@/api/animation';
import { observer, calcAeATimeToPbr } from '@hc/editor-core';
import { useEffect, useMemo, useRef, useState } from 'react';
import InfiniteLoader, { InfiniteLoaderRef } from '@/components/InfiniteLoader';
import { InputNumber, Slider, message } from 'antd';

import './index.modules.less';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import { useHover } from 'ahooks';
import { stopPropagation } from '@/utils/single';
import AnimationImport from '.';
import { typeKeyImport, useSetAnimation, animationTypeImport } from './hook';

const ButtonItem = ({
  title,
  choosed,
  ...reset
}: {
  title: string;
  choosed: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      {...reset}
      className={classNames('type-item', {
        choosed,
      })}
    >
      {title}
    </div>
  );
};
const AnimationItem = ({
  item,
  value,
  onAdd,
  onDelete,
}: {
  item: any;
  value: any;
  onAdd: () => void;
  onDelete: () => void;
}) => {
  const ref = useRef(null);
  const isHover = useHover(ref);
  return (
    <div
      key={item.id}
      className={classNames('aniImp-upload-item', {
        'aniImp-upload-item-choosed': value?.resId === item.id,
      })}
      ref={ref}
      onClick={onAdd}
    >
      <div className="aniImp-item-title">{item.title}</div>
      <div className="aniImp-item-right">
        {isHover && (
          <>
            <XiuIcon
              type="iconicons8_trash"
              className="icon"
              style={{ fontSize: 22 }}
              onClick={e => {
                stopPropagation(e);
                onDelete();
              }}
            />
            <XiuIcon type="icona-2" className="icon" onClick={onAdd} />
          </>
        )}
      </div>
    </div>
  );
};
function AnimationImportList() {
  const {
    value,
    kw,
    assetAeaDuration,
    max,
    setAnimationSpeed,
    setAnimation,
    clearAnimation,
  } = useSetAnimation();
  const listRef = useRef<InfiniteLoaderRef>();
  const [reload, setReload] = useState(false);
  const [type, setType] = useState<typeKeyImport>('in');
  const currentAnimation = useMemo(() => {
    if (kw && type === 'free') {
      return kw;
    }
    // @ts-ignore
    if (value && value[animationTypeImport[type]]) {
      return value[animationTypeImport[type]];
    }
    return undefined;
  }, [type, kw, value?.i, value?.o]);

  useEffect(() => {
    if (reload) {
      listRef.current?.reload();
      setReload(false);
    }
  }, [reload]);
  const deleteItem = async (item: any) => {
    const res = await deleteAnimation(item.id);
    if (res.code === 0) {
      setReload(true);
      message.success('删除成功！');
    }
  };
  return (
    <div className="aniImp-upload">
      <div className="aniImp-upload-type">
        <div className="aniImp-upload-typeImp">
          <AnimationImport
            onChange={type => {
              setReload(true);
              setType(type);
            }}
          />
        </div>
        <ButtonItem
          title="入场"
          choosed={type === 'in'}
          onClick={() => {
            setType('in');
          }}
        />
        <ButtonItem
          title="出场"
          choosed={type === 'out'}
          onClick={() => {
            setType('out');
          }}
        />
        <ButtonItem
          title="自由动画"
          choosed={type === 'free'}
          onClick={() => {
            setType('free');
          }}
        />
      </div>
      <InfiniteLoader
        ref={listRef}
        request={getMyAnimation}
        params={{ type }}
        wrapStyle={{ flex: 1 }}
        formatResult={res => {
          return { pageTotal: res?.data?.pageTotal, list: res?.data?.items };
        }}
        isSkeleton={false}
        className="aniImp-upload-list"
      >
        {({ list }) => {
          return (
            <>
              <div
                className="aniImp-upload-item"
                onClick={() => {
                  clearAnimation(type);
                }}
              >
                <div className="aniImp-item-title">无动画</div>
              </div>

              {list.map(item => {
                return (
                  <AnimationItem
                    item={item}
                    key={item.id}
                    value={currentAnimation}
                    onDelete={() => {
                      deleteItem(item);
                    }}
                    onAdd={() => {
                      setAnimation(item);
                    }}
                  />
                );
              })}
            </>
          );
        }}
      </InfiniteLoader>
      {type !== 'free' && currentAnimation?.resId && (
        <div className="aniImp-upload-down">
          <span className="timeLabel">动画时长：</span>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <InputNumber
              size="small"
              value={`${
                assetAeaDuration &&
                (assetAeaDuration?.[animationTypeImport[type]] / 1000).toFixed(
                  1,
                )
              }s`}
              style={{ height: 22, width: 50, fontSize: 12 }}
            />
            <Slider
              tooltipVisible={false}
              step={100}
              min={100}
              max={max[animationTypeImport[type]]}
              value={assetAeaDuration?.[animationTypeImport[type]]}
              onChange={time => {
                const pbr = calcAeATimeToPbr(time, currentAnimation.kw);
                setAnimationSpeed(type, pbr);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default observer(AnimationImportList);
