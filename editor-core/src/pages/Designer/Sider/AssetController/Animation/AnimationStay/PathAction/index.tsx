import { XiuIcon } from '@/components';
import {
  observer,
  getCurrentAsset,
  usePathAnimationObserver,
  useStayEffectObserver,
} from '@hc/editor-core';
import { config } from '@/kernel/utils/config';
import Image from '@/pages/SidePanel/Upload/FileItem/Image';
import { Button, Radio, Switch } from 'antd';
import SWActionSlider from '@/components/SWActionSlider';
import '../index.modules.less';
import { pathAnimationSpeed } from '@/config/basicVariable';
import { stopPropagation } from '@/utils/single';
import { PATHLIST } from '@/constants/animation';

const ActionItem = props => {
  const { title, children } = props;
  return (
    <div className="snake-action-item">
      {title && <div className="snake-action-item-title">{title}</div>}
      {children}
    </div>
  );
};
const PathAction = () => {
  const asset = getCurrentAsset();
  const { graph, duration } = asset?.attribute?.stayEffect;
  const animationItem = PATHLIST.filter(item => {
    return item.key === graph?.key;
  })[0];
  const {
    maxDuration,
    updateDuration,
    updateAnimationLoop,
    updateAnimationEase,
    clearPath,
  } = usePathAnimationObserver();
  const { setPreview } = useStayEffectObserver();
  function onClick(e) {
    stopPropagation(e);
  }
  function onChangeTime(data: number) {
    updateDuration(data);
  }
  function onChangeLoop(data: boolean) {
    updateAnimationLoop(data);
  }
  function onChangeEase(e: Event) {
    updateAnimationEase(e.target.value);
  }
  function playVideofunc() {
    if (asset) {
      setPreview();
    }
  }
  return (
    <>
      <div className="action-path-type" onClick={onClick}>
        <div className="action-path-type-info">
          <div className="action-path-type-pic">
            <Image poster={animationItem?.url} />
          </div>
          <div className="action-path-type-name">
            {graph?.freePathType === 'line' ? '直线' : '曲线'}
          </div>
        </div>
        <div className="action-path-type-button">
          {/* <Button className="button-item">替换</Button> */}
          <Button className="button-item" onClick={clearPath}>
            删除
          </Button>
        </div>
      </div>
      <div className="snake-action-box">
        <ActionItem title="单次运动时间">
          <div className="snake-action-slider">
            <SWActionSlider
              tipFormatter={(value: number) =>
                `${Number(value / 1000).toFixed(1)}秒`
              }
              caption={['', '']}
              value={duration}
              step={100}
              min={100}
              max={maxDuration}
              onChange={onChangeTime}
            />
            <span style={{ marginLeft: 5, whiteSpace: 'nowrap' }}>
              {Number(duration / 1000).toFixed(1)}秒
            </span>
          </div>
        </ActionItem>
        <ActionItem title="单次运动速度">
          <div className="snake-action-item-radio">
            <Radio.Group onChange={onChangeEase} defaultValue={graph?.easing}>
              {pathAnimationSpeed.map((item, index) => {
                return <Radio value={index}>{item.desc}</Radio>;
              })}
            </Radio.Group>
          </div>
        </ActionItem>
        <ActionItem title="循环运动">
          <Switch
            defaultChecked={graph?.loop}
            className="action-switch"
            onChange={onChangeLoop}
          />
        </ActionItem>
        <div className="snake-action-button">
          <Button className="snake-action-button-item" onClick={playVideofunc}>
            预览
          </Button>
        </div>
      </div>
    </>
  );
};
export default observer(PathAction);
