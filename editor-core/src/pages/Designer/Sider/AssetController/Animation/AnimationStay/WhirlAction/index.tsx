import '../index.modules.less';
import { Radio, Button, Switch } from 'antd';
import {
  observer,
  useWhirlAnimationObserver,
  useStayEffectObserver,
} from '@hc/editor-core';
import SWActionSlider from '@/components/SWActionSlider';
import { SnakeActionItem } from '../SnakeAction';

const WhirlAction = () => {
  const { attach, inWhirl, updateDirection, updateSpeed, startSetCenter } =
    useWhirlAnimationObserver();
  const { setPreview } = useStayEffectObserver();
  /**
   * 振幅
   * @param {*} value
   */
  const directionChange = event => {
    updateDirection(event.target.value);
  };

  /**
   * 速度
   * @param {*} value
   */
  const speedChange = value => {
    updateSpeed(value);
  };
  // 开启设置旋转中心
  const onChangeLoop = value => {
    startSetCenter(value);
  };
  function playVideofunc() {
    setPreview();
  }
  return (
    <div className="snake-action-box">
      <SnakeActionItem title="旋转方向">
        <div className="snake-action-item-radio">
          <Radio.Group
            defaultValue={attach?.data?.ccw}
            onChange={directionChange}
          >
            <Radio value>顺时针</Radio>
            <Radio value={false}>逆时针</Radio>
          </Radio.Group>
        </div>
      </SnakeActionItem>
      <SnakeActionItem title="旋转速度">
        <div className="snake-action-slider">
          <SWActionSlider
            tipFormatter={null}
            caption={['慢', '快']}
            defaultValue={attach?.data?.speed}
            step={0.2}
            min={0.05}
            max={2.5}
            onChange={speedChange}
          />
        </div>
      </SnakeActionItem>
      <SnakeActionItem title="开启设置旋转中心">
        <Switch
          defaultChecked={inWhirl}
          className="action-switch"
          onChange={onChangeLoop}
        />
      </SnakeActionItem>

      <div className="snake-action-button">
        <Button className="snake-action-button-item" onClick={playVideofunc}>
          预览
        </Button>
      </div>
    </div>
  );
};
export default observer(WhirlAction);
