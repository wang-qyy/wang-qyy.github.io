import '../index.modules.less';
import Circular from '@/components/Circular';
import {
  observer,
  useShakeAnimationObserver,
  useStayEffectObserver,
} from '@hc/editor-core';
import { Button } from 'antd';
import SWActionSlider from '@/components/SWActionSlider';

export const SnakeActionItem = (props: any) => {
  const { title, extra, children } = props;
  return (
    <div className="snake-action-item">
      <div className="snake-action-item-title">{title}</div>
      {children}
    </div>
  );
};
const SnakeAction = () => {
  const { attach, updateAmplitude, updateDirection, updateSpeed } =
    useShakeAnimationObserver();
  const { setPreview } = useStayEffectObserver();
  /**
   * 方向
   * @param {*} value
   */
  const directionChange = (value: number) => {
    updateDirection(value);
  };

  /**
   * 振幅
   * @param {*} value
   */
  const swingChange = (value: number) => {
    updateAmplitude(value);
  };

  /**
   * 速度
   * @param {*} value
   */
  const speedChange = (value: number) => {
    updateSpeed(value);
  };
  const playVideofunc = () => {
    setPreview();
  };
  return (
    <div className="snake-action-box">
      <SnakeActionItem title="抖动方向">
        <div className="snake-action-circular-box">
          <Circular
            onChange={directionChange}
            value={attach?.data?.direction}
          />
          {attach?.data?.direction}°
        </div>
      </SnakeActionItem>
      <SnakeActionItem title="抖动振幅">
        <div className="snake-action-slider">
          <SWActionSlider
            tipFormatter={null}
            defaultValue={attach?.data?.amplitude}
            step={0.05}
            min={0.05}
            max={0.5}
            onChange={swingChange}
          />
        </div>
      </SnakeActionItem>
      <SnakeActionItem title="抖动速度">
        <div className="snake-action-slider">
          <SWActionSlider
            tipFormatter={null}
            defaultValue={attach?.data?.speed}
            caption={['慢', '快']}
            step={0.2}
            min={0.4}
            max={4}
            onChange={speedChange}
          />
        </div>
      </SnakeActionItem>
      <div className="snake-action-button">
        <Button className="snake-action-button-item" onClick={playVideofunc}>
          预览
        </Button>
      </div>
    </div>
  );
};

export default observer(SnakeAction);
