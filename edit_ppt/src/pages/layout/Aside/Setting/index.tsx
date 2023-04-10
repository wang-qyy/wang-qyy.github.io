import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Button } from 'antd';

import FontFamily from '@/pages/AssetSettings/FontFamily';
import FontSize from '@/pages/AssetSettings/FontSize';
import FontStyle from '@/pages/AssetSettings/FontStyle';
import Spacing from '@/pages/AssetSettings/Spacing';
import Rotation from '@/pages/AssetSettings/Rotation';
import FontColor from '@/pages/AssetSettings/FontColor';
import Outline from '@/pages/AssetSettings/Outline';
import Shadow from '@/pages/AssetSettings/Shadow';

import Position from '@/pages/AssetSettings/Position';
import LineHeight from '@/pages/AssetSettings/LineHeight';
import Alignment from '@/pages/AssetSettings/Alignment';
import {
  getCurrentAsset,
  isTempModuleType,
  unGroupModule,
  isModuleType,
  useGetCurrentInfoByObserver,
} from '@/kernel';

import { useSettingsPanel } from '@/pages/store/SettingsPanel';
import { config } from '@/config/constants';

import BackgroundSetting from '../../../BackgroundSetting';
import styles from './index.modules.less';
import { useEffect } from 'react';

/**
 * @description 元素设置面板
 */
function Settings() {
  const asset = getCurrentAsset();

  const { active, activeSettingsPanel, openSettingsPanel } = useSettingsPanel();

  useEffect(() => {
    if (asset) {
      activeSettingsPanel(asset.meta.type);
      openSettingsPanel(true);
    } else {
      if (!config.is_designer) {
        activeSettingsPanel('background');
        openSettingsPanel(true);
      } else {
        openSettingsPanel(false);
      }
    }
  }, [asset]);

  return (
    <>
      <div
        className={classNames('layout-aside-content', styles['setting-panel'], {
          [styles['setting-panel-open']]: active === 'background',
        })}
      >
        <BackgroundSetting />
      </div>

      <div
        className={classNames('layout-aside-content', styles['setting-panel'], {
          [styles['setting-panel-open']]: ['text', 'image'].includes(active),
        })}
      >
        {asset && isModuleType(asset) && (
          <Button onClick={() => unGroupModule(asset)}>解组</Button>
        )}

        {asset && !isModuleType(asset) && !isTempModuleType(asset) && (
          <>
            <div className="flex-box items-center mb-16">
              <FontFamily
                asset={asset}
                style={{ flex: 1, overflow: 'hidden' }}
              />
              <FontSize asset={asset} />
            </div>
            <FontColor asset={asset} />
            <div className="flex-box mb-16" style={{ gap: 6 }}>
              <LineHeight asset={asset} />
              <Spacing asset={asset} />
              <Rotation asset={asset} />
            </div>

            <FontStyle asset={asset} />
            <Alignment />
            <Outline asset={asset} />
            <Shadow asset={asset} />
            <Position asset={asset} />
          </>
        )}
      </div>
    </>
  );
}

export default observer(Settings);
