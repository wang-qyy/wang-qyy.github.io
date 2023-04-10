// 元素轨道默认高度
export const defaultTrackHeight = 30;

// 新轨道高度
export const appendTrackHeight = 4;

// 默认最小时长限制
export const defaultMinDuration = 4;

// 元素默认样式
export const defaultRender = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#C86DD7',
      borderRadius: '5px',
    }}
  />
);

// 元素轨道默认配置
export const defaultTrackOption = {
  height: 30,
  render: defaultRender,
};
