import { useState, memo } from 'react';
import { Tabs } from 'antd';
import { cloneDeep } from 'lodash-es';

import {
  getTemplateWatermark,
  removeAsset,
  AssetClass,
  observer,
  getCurrentTemplate,
} from '@hc/editor-core';
import QRCode from 'qrcode.react';
import { useTextWatermarkPopover } from '@/store/adapter/useGlobalStatus';
import TextWatermark from './TextWatermark';
import ImgWatermark from './ImgWatermark';
import { setWatermark } from '../../handler';

import styles from './index.less';
// import Tabs from '../../SidePanel/UserSpace/Tabs';
const { TabPane } = Tabs;

/**
 * setAssetVisible 切换水印类型时 设置水印显隐
 */

const Watermark = () => {
  const { close } = useTextWatermarkPopover();

  const [activeTab, setActiveTab] = useState('text');
  const currentTemplate = getCurrentTemplate();

  const watermarkInfo = getTemplateWatermark();
  // console.log('watermarkInfo', toJS(watermarkInfo));

  const [prevWatermark, setPrevWatermark] = useState<AssetClass>();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // console.log('handleTabChange', watermarkInfo);
    // console.log('prevWatermark', prevWatermark);

    const watermarkAssets = currentTemplate.watermark;
    Object.keys(watermarkAssets).forEach((key: 'text' | 'image') => {
      const watermark = watermarkAssets[key];
      console.log(watermark);
      if (watermark) {
        watermark.update({ meta: { hidden: tab !== key } });
      }
    });

    // if (watermarkInfo) {
    //   setPrevWatermark(cloneDeep(watermarkInfo));
    //   removeAsset(watermarkInfo);
    // } else {
    //   setPrevWatermark(undefined);
    // }
    // if (prevWatermark)
    //   setTimeout(() => {
    //     setWatermark(prevWatermark, 'add');
    //   }, 0);
  };

  return (
    <div className={styles.watermarkTabsWarp}>
      <div className={styles.watermarkTabs}>
        <Tabs
          defaultActiveKey="text"
          activeKey={activeTab}
          onChange={active => {
            close();
            handleTabChange(active);
          }}
        >
          <TabPane tab="文字水印" key="text">
            <TextWatermark />
          </TabPane>
          <TabPane
            tab={
              <div>
                图片水印
                <div className={styles.toolsVipCard}>VIP</div>
              </div>
            }
            key="image"
          >
            <ImgWatermark tiledShow={false} />
          </TabPane>
        </Tabs>
      </div>
      <div className={styles.watermarkFooter}>
        {/* <img src={ossPath('/image/watermark/watermark.png')} alt="" /> */}
        <QRCode
          value="https://work.weixin.qq.com/kfid/kfcf7c815de3b3edd21"
          size={100}
        />
        <div className={styles.watermarkFooterText}>
          遇到问题，微信扫码咨询客服
        </div>
      </div>
    </div>
  );
};

export default observer(Watermark);
