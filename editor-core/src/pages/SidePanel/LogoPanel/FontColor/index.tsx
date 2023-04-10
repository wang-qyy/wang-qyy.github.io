import { Popover } from 'antd';
import { SketchPicker } from 'react-color';
import { useUpdateLogoTextColorByObserver, observer } from '@hc/editor-core';
import colorIcon from '@/assets/image/color.png';

import './index.less';
import { clickActionWeblog } from '@/utils/webLog';

function FontFamily() {
  const [value, update] = useUpdateLogoTextColorByObserver();

  return (
    <div className="fontcolor">
      <Popover
        trigger="click"
        placement="rightBottom"
        overlayClassName="color-picker"
        onVisibleChange={visible => {}}
        getTooltipContainer={trigger => trigger.parentNode as HTMLElement}
        content={
          <SketchPicker
            width={270}
            color={value}
            onAfterChange={() => {}}
            onChange={(color: { rgb: {} }) => {
              clickActionWeblog('action_logo_color');
              update(color.rgb);
            }}
          />
        }
      >
        <div className="fontcolorIcon">
          <img src={colorIcon} alt="colorIcon" width={30} height={36} />
          {/* <div className="toolsVipCard">VIP</div> */}
        </div>
      </Popover>
    </div>
  );
}

export default observer(FontFamily);
