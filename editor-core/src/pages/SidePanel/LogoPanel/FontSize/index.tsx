import { useUpdateLogoTextFontSizeByObserver, observer } from '@hc/editor-core';
import Sliders from '@/pages/Watermark/Content/Aside/Sliders';

function FontSize() {
  const [value, update] = useUpdateLogoTextFontSizeByObserver();

  return (
    <Sliders
      title="水印大小"
      bindChange={update}
      num={value}
      min={25}
      onAfterChange={() => {}}
    />
  );
}

export default observer(FontSize);
