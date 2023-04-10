import {
  observer,
  BGA_ID_List,
  setBgAnimation,
  useGetCurrentAsset,
} from '@hc/editor-core';
import './index.modules.less';
import BGAPreview from './BGAPreview';

const ColorBackground = () => {
  const asset = useGetCurrentAsset();
  return (
    <div className="bgAni-view">
      <BGAPreview bgaId={0} onClick={setBgAnimation} />
      {BGA_ID_List.map(item => (
        <BGAPreview
          key={item}
          bgaId={item}
          active={asset?.attribute?.bgAnimation?.id}
          onClick={setBgAnimation}
        />
      ))}
    </div>
  );
};

export default observer(ColorBackground);
