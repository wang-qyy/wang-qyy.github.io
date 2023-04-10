import { XiuIcon } from '@/components';
import {
  useShakeAnimationObserver,
  useWhirlAnimationObserver,
  useStayEffectObserver,
  getCurrentAsset,
  useAniPathEffect,
} from '@hc/editor-core';
import { message } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import './index.modules.less';
import PathAction from './PathAction';
import PathAnimationList from './PathAnimationList';
import SnakeAction from './SnakeAction';
import WhirlAction from './WhirlAction';

const AnimationStayUpItem = (props: {
  title: string;
  icon: string;
  choosed: boolean;
  visible?: boolean;
  onClick: () => void;
}) => {
  const { title, icon, choosed, visible = true, onClick } = props;
  return (
    <div
      className={classNames('animation-stay-up-item', {
        'animation-stay-item-choosed': choosed,
        visible: !visible,
      })}
      onClick={onClick}
    >
      <div className="left">
        <XiuIcon type={icon} />
      </div>
      <span>{title}</span>
    </div>
  );
};
const AnimationStay = () => {
  const asset = getCurrentAsset();
  const { changStatue, start } = useAniPathEffect();
  const { clear } = useStayEffectObserver();
  const { start: startWhirl } = useWhirlAnimationObserver();
  const { start: startShake } = useShakeAnimationObserver();
  const [showPath, setShowPath] = useState(true);
  const checkdInfo = useMemo(() => {
    let isPath = false;
    let isShake = false;
    let isWhirl = false;
    if (asset?.attribute?.stayEffect) {
      const { graph, attach } = asset?.attribute?.stayEffect;
      if (graph) {
        isPath = true;
      }
      if (attach?.type === 'shake') {
        isShake = true;
      }
      if (attach?.type === 'Whirl') {
        isWhirl = true;
      }
    }
    return {
      isPath,
      isShake,
      isWhirl,
    };
  }, [
    asset?.attribute?.stayEffect?.attach,
    asset?.attribute?.stayEffect?.graph,
  ]);
  useEffect(() => {
    if (asset?.attribute?.stayEffect?.graph) {
      setShowPath(true);
    }
    if (asset?.attribute?.stayEffect?.attach) {
      setShowPath(false);
    }
  }, [asset?.attribute?.stayEffect]);
  return (
    <div className="animation-stay">
      <div className="animation-stay-up">
        {/* <AnimationStayUpItem
          choosed={false}
          title="设置预设"
          icon="iconwushuju"
          onClick={() => {
            start();
          }}
        /> */}
        <AnimationStayUpItem
          choosed={false}
          title="无动画"
          icon="iconwushuju"
          visible={!!asset?.attribute?.stayEffect}
          onClick={() => {
            if (
              asset?.attribute?.stayEffect?.attach ||
              asset?.attribute?.stayEffect?.graph
            ) {
              clear();
              setShowPath(false);
            } else {
              message.info('请先设置停留特效！');
            }
          }}
        />
        <AnimationStayUpItem
          title="路径动画"
          choosed={checkdInfo.isPath}
          icon="iconluji"
          onClick={() => {
            clear();
            setShowPath(true);
          }}
        />
        <AnimationStayUpItem
          title="旋转动画"
          choosed={checkdInfo.isWhirl}
          icon="iconchuangkoudoudong"
          onClick={() => {
            startWhirl();
            setShowPath(false);
          }}
        />
        <AnimationStayUpItem
          title="抖动动画"
          choosed={checkdInfo.isShake}
          icon="iconutil-rotate-init"
          onClick={() => {
            startShake();
            setShowPath(false);
          }}
        />
      </div>
      <div className="animation-stay-down">
        {showPath && asset?.attribute?.stayEffect?.graph && <PathAction />}
        {/* 抖动 */}
        {!showPath &&
          asset?.attribute?.stayEffect?.attach?.type === 'shake' && (
            <SnakeAction />
          )}
        {/* 旋转 */}
        {!showPath &&
          asset?.attribute?.stayEffect?.attach?.type === 'Whirl' && (
            <WhirlAction />
          )}

        {showPath && <PathAnimationList visible />}
      </div>
    </div>
  );
};
export default observer(AnimationStay);
