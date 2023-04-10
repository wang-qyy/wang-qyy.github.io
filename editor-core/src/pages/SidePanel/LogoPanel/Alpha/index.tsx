import { useUpdateLogoAlphaByObserver, observer } from '@hc/editor-core';
import Sliders from '@/pages/Watermark/Content/Aside/Sliders';

function Opacity() {
  const [value, update] = useUpdateLogoAlphaByObserver();

  return (
    <Sliders
      title="不透明度"
      bindChange={value => {
        update(value);
      }}
      num={value}
      min={25}
      onAfterChange={() => {}}
    />
  );
}

export default observer(Opacity);
