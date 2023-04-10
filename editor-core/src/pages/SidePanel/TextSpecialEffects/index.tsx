import { Button } from 'antd';
import SidePanelWrap from '@/components/SidePanelWrap';
import { observer, toJS, useFontEffectByObserver } from '@hc/editor-core';

import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';

import TextList from './TextList';

import './index.less';

const TextSpecialEffects = () => {
  const { close } = useSettingPanelInfo();
  const { clearFontEffect, value } = useFontEffectByObserver();

  return (
    <SidePanelWrap
      wrapClassName="side-setting-panel textEffect"
      header="字体特效设置"
      onCancel={close}
      bottom={
        <div
          className="textEffectBottom"
          hidden={!(value.effect || value.effectColorful)}
        >
          <Button onClick={clearFontEffect}>移除特效</Button>
        </div>
      }
    >
      <TextList clickType="update" active />
    </SidePanelWrap>
  );
};

export default observer(TextSpecialEffects);
