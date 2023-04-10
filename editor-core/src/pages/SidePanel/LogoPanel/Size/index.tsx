import { useUpdateLogoImageSizeByObserver, observer } from '@hc/editor-core';
import Sliders from '@/pages/Watermark/Content/Aside/Sliders';
import { clickActionWeblog } from '@/utils/webLog';

function Size({ type }: { type: 'text' | 'image' }) {
  const [value, update] = useUpdateLogoImageSizeByObserver();

  return (
    <Sliders
      title="水印大小"
      bindChange={value => {
        console.log(type);
        update(value);
        clickActionWeblog('action_logo_size', { action_label: type });
      }}
      num={value}
      min={25}
      onAfterChange={() => {}}
    />
  );
}

export default observer(Size);
