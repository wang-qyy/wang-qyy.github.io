import { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';

import { observer, useGetCurrentAsset } from '@hc/editor-core';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';
import MultiReplace from '@/pages/Content/Bottom/Simple/MultiReplace';
import Animation from './Animation';
import BackgroundAnimation from './BackgroundAnimation';
import TextColor from './TextColor';
import TextSpecialEffects from './TextSpecialEffects';
import UploadFont from './UploadFont';
import Upload from './Upload';
import FiltersAdjust from './FiltersAdjust';
import ShadowPanel from './ShadowPanel';
import Filters from './Filters';

import TransitionVideo from './TransitionVideo';

/**
 * @description 工具面板
 * */
function SettingPanel() {
  const asset = useGetCurrentAsset();

  const {
    value: { panelKey, visible },
    close,
    open,
  } = useSettingPanelInfo();

  useEffect(() => {
    // if (asset?.meta.type === 'text') {
    //   open('tool-fontEffects');
    // } else
    if (!asset || visible) {
      close();
    }
  }, [asset?.meta.type]);

  return (
    <>
      {/* 上传字体 */}
      <LazyLoadComponent visible={panelKey === 'tool-fontFamily'}>
        <UploadFont activeToolMenu={panelKey} />
      </LazyLoadComponent>

      {/* 转场 */}
      <LazyLoadComponent visible={panelKey === 'video-transition'}>
        <TransitionVideo />
      </LazyLoadComponent>
      {/* 特效字 */}
      <LazyLoadComponent
        keyName="textSpecialEffects"
        visible={panelKey === 'tool-fontEffects'}
      >
        <TextSpecialEffects />
      </LazyLoadComponent>
      {/* 动效 */}
      <LazyLoadComponent
        keyName="textAnimation"
        visible={panelKey === 'tool-animation'}
      >
        <Animation />
      </LazyLoadComponent>

      {/* 文字颜色 背景颜色 svg颜色设置都统一用文字颜色面板 */}
      <LazyLoadComponent
        keyName="fontColor"
        visible={[
          'tool-fontColor',
          'tool-svg-color',
          'tool-svg-path-color',
          'tool-template_background_color',
        ].includes(panelKey)}
      >
        <TextColor />
      </LazyLoadComponent>

      {/* 背景动画 */}
      <LazyLoadComponent visible={panelKey === 'tool-t_b_animation'}>
        <BackgroundAnimation />
      </LazyLoadComponent>

      {/* 滤镜 */}
      <LazyLoadComponent visible={panelKey === 'tool-filters'}>
        <Filters />
      </LazyLoadComponent>

      {/* 滤镜调整 */}
      <LazyLoadComponent visible={panelKey === 'tool-filtersAdjust'}>
        <FiltersAdjust />
      </LazyLoadComponent>

      {/* 特效图层调整 */}
      <LazyLoadComponent visible={panelKey === 'tool-effectLayer'}>
        <FiltersAdjust />
      </LazyLoadComponent>

      {/* 投影调整 */}
      <LazyLoadComponent visible={panelKey === 'tool-shadow'}>
        <ShadowPanel />
      </LazyLoadComponent>

      {/* 批量替换 */}
      {panelKey === 'tool_multiReplace' && (
        <Upload
          Bottom={MultiReplace}
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>批量替换</span>
              <div className="side-panel-close" onClick={close}>
                <CloseOutlined />
              </div>
            </div>
          }
        />
      )}
    </>
  );
}

export default observer(SettingPanel);
