import { useMemo, useState } from 'react';
import { Button } from 'antd';
import classNames from 'classnames';
import {
  Asset,
  useGetAllTemplateByObserver,
  getTemplateTimeScale,
  setCurrentTime,
  useCurrentTemplate,
  observer,
} from '@hc/editor-core';
import { clickActionWeblog } from '@/utils/webLog';

import {
  setBottomMode,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';
import { audioBlur } from '@/store/adapter/useAudioStatus';
import PlayVideo from '../PlayVideo';
import Text from './Text';
import Audio from './Audio';
import Image from './Image';
import { getReplaceAssets } from './handler';

import './index.less';

type AssetType = 'text' | 'audio' | 'image';
const tabs: { key: AssetType; name: string; weblog: string }[] = [
  { key: 'image', name: '替换图片/视频', weblog: '0006' },
  { key: 'text', name: '修改文字', weblog: '0007' },
  { key: 'audio', name: '替换音乐', weblog: '0008' },
];

function SimpleBottom() {
  const { template } = useCurrentTemplate();
  const { templates } = useGetAllTemplateByObserver();
  const [assetType, setAssetType] = useState<AssetType>('image');

  const {
    open: openSettingPanel,
    close: closeSettingPanel,
    value: { panelKey },
  } = useSettingPanelInfo();

  const { texts, images } = getReplaceAssets();

  // 切换片段
  function selectPart(index: number) {
    const time = getTemplateTimeScale()[index][0];
    setCurrentTime(time, false);
  }

  const assets = useMemo(() => {
    let assetsDom = <></>;
    switch (assetType) {
      case 'text':
        assetsDom = <Text list={texts} />;
        break;
      case 'audio':
        assetsDom = <Audio />;
        break;
      case 'image':
        assetsDom = <Image list={images} />;
        break;
    }

    return assetsDom;
  }, [assetType, texts, images]);

  return (
    <>
      <div className="xiudod-bottom-handler" onClick={closeSettingPanel}>
        <div className="xiudod-bottom-simple-tabs">
          {tabs.map(item => (
            <span
              className={classNames('xiudod-bottom-simple-tab', {
                'xiudod-bottom-simple-tab-active': assetType === item.key,
              })}
              key={item.key}
              onClick={() => {
                clickActionWeblog(`bottom_${item.weblog}`);
                setAssetType(item.key);
              }}
            >
              {item.name}
            </span>
          ))}
        </div>
        <div
          className="bottom-simple-goback"
          onClick={() => {
            audioBlur();
            setBottomMode('timeline');
            clickActionWeblog('bottom_0005');
          }}
        >
          {'<'} 返回时间轴版本
        </div>
      </div>
      <div className="bottom-simple-content">
        <PlayVideo />
        <div className="bottom-simple-assets">{assets}</div>

        <div
          hidden={!images.length || assetType !== 'image'}
          className="image-multi-replace-wrap"
        >
          <Button
            type="primary"
            disabled={panelKey === 'tool_multiReplace'}
            style={{ borderRadius: 15 }}
            onClick={() => {
              openSettingPanel('tool_multiReplace');
              clickActionWeblog('bottom_0002');
            }}
          >
            批量替换
          </Button>
        </div>
      </div>
      <div
        className="part-tabs"
        hidden={assetType === 'audio'}
        onClick={closeSettingPanel}
      >
        {templates.map((part, index) => (
          <span
            className={classNames('part-tabs-name', {
              'part-tabs-name-active': template.id === part.id,
            })}
            key={`simplate-bottom-${part.id}`}
            onClick={() => selectPart(index)}
          >
            片段{index + 1}
          </span>
        ))}
      </div>
    </>
  );
}

export default observer(SimpleBottom);
