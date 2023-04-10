import { Tooltip, Slider } from 'antd';
import { ArrowsAltOutlined } from '@ant-design/icons';
import { useDebounceFn, useSize, useUpdateLayoutEffect } from 'ahooks';
import { observer } from '@hc/editor-core';
import { useTimeAxisScale } from '@/store/adapter/useGlobalStatus';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import { handleTimeAxisFitScreen } from '@/pages/Content/Bottom/handler';
import { useTimeAxisScaleRange } from '../handler';
import './index.less';

/**
 * @description 时间轴缩放
 * */
function TimelineHandler() {
  const { value: timeAxisScale, update: setTimeAxisScale } = useTimeAxisScale();

  const { max, min, fit } = useTimeAxisScaleRange();
  const container = document.querySelector('.xiudodo-bottom');
  const { width } = useSize(container as HTMLElement);

  useUpdateLayoutEffect(() => {
    handleTimeAxisFitScreen();
  }, [width]);

  const webLog = useDebounceFn(
    () => {
      clickActionWeblog('time_line_slider');
    },
    { wait: 500 },
  );

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}
      onMouseDown={stopPropagation}
    >
      <span>时间轴调整：</span>
      <Slider
        min={min}
        max={max}
        step={0.1}
        style={{ width: 160 }}
        value={[timeAxisScale]}
        onChange={value => {
          setTimeAxisScale(value);
          webLog.run();
        }}
        tooltipVisible={false}
      />
      <Tooltip title="适应屏幕" getTooltipContainer={ele => ele}>
        <div
          className="fit-screen"
          onClick={() => {
            clickActionWeblog('time_line_fit_screen');
            setTimeAxisScale(fit);
          }}
        >
          <ArrowsAltOutlined style={{ transform: 'rotate(45deg)' }} />
        </div>
      </Tooltip>
    </div>
  );
}
export default observer(TimelineHandler);
