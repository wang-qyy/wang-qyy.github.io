import { useFontEffectByObserver, observer } from '@hc/editor-core';
import EffectColorList from '@/pages/Designer/Sider/Text/EffectColor/list';
import { XiuIcon } from '@/components';

const TextSignature = () => {
  const { updateSignatureFontEffect } = useFontEffectByObserver();
  function handleItemClick(type: string, id?: string) {
    if (id) {
      fetch(`//js.xiudodo.com/colorful/presets/v2/${id}.json`)
        .then(response => response.json())
        .then(res => {
          updateSignatureFontEffect({
            resId: id,
            effect: res,
          });
        });
    } else {
      updateSignatureFontEffect(undefined);
    }
  }
  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill,minmax(80px ,1fr))',
        padding: '4px 16px 0',
      }}
    >
      <EffectColorList
        onHandleClick={handleItemClick}
        type="update"
        icon={<XiuIcon type="icontihuan1" />}
      />
    </div>
  );
};
export default observer(TextSignature);
