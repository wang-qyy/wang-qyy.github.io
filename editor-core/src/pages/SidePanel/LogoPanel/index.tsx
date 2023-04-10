import { useEffect, useState } from 'react';
import { Tabs, Switch } from 'antd';

import {
  useUpdateLogoRepeat,
  changeLogoType,
  useGetLogoByObserver,
  observer,
  toJS,
} from '@hc/editor-core';
import { useTextWatermarkPopover } from '@/store/adapter/useGlobalStatus';

import { clickActionWeblog } from '@/utils/webLog';

import FontFamily from './FontFamily';
import FontColor from './FontColor';
import FontSize from './FontSize';
import TextInput from './Text';
import Position from './Position';
import Size from './Size';
import UploadLogo from './UploadLogo';

import Alpha from './Alpha';

import './index.less';

const { TabPane } = Tabs;

const Watermark = () => {
  const { close } = useTextWatermarkPopover();

  const [repeat, updateRepeat] = useUpdateLogoRepeat();
  const logo = useGetLogoByObserver();

  const [activeTab, setActiveTab] = useState(logo?.meta.type || 'image');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="logoWatermark">
      <div className="logoWatermarkTabs">
        <Tabs
          defaultActiveKey="image"
          activeKey={activeTab}
          onChange={active => {
            close();
            handleTabChange(active);
            changeLogoType(active);
          }}
        >
          <TabPane
            tab={
              <div>
                图片LOGO
                {/* <div className={styles.toolsVipCard}>VIP</div> */}
              </div>
            }
            key="image"
          >
            <div style={{ padding: 18, height: '100%', overflow: 'auto' }}>
              <UploadLogo />
              <div className="logo-handle-item">
                <span>图片平铺</span>
                <Switch
                  defaultChecked={repeat}
                  onChange={e => {
                    updateRepeat(e);
                    clickActionWeblog('action_logo_isFull');
                  }}
                />
              </div>
              <Alpha />
              <Size type="image" />

              <div className="logo-handle-item">
                <span>水印位置</span>
                <Position />
              </div>
            </div>
          </TabPane>
          <TabPane tab="文字LOGO" key="text">
            <div style={{ padding: 18, height: '100%', overflow: 'auto' }}>
              <TextInput />
              <div className="logo-handle-item">
                <span>文字平铺</span>
                <Switch
                  defaultChecked={repeat}
                  onChange={e => {
                    clickActionWeblog('action_logo_isFull');
                    updateRepeat(e);
                  }}
                />
              </div>
              <div className="logo-handle-item">
                <FontFamily />
                <FontColor />
              </div>
              <Alpha />
              {/* <FontSize /> */}
              <Size type="text" />

              <div className="logo-handle-item">
                <span>水印位置</span>
                <Position />
              </div>
            </div>

            {/* <TextWatermark /> */}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default observer(Watermark);
