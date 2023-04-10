import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Tabs, Slider, InputNumber } from 'antd';
import {
  observer,
  useAssetAeAByObserver,
  calcAeATimeToPbr,
  AeA,
  useGetCurrentAsset,
  useAniPathEffect,
} from '@hc/editor-core';
import AnimationList from '@/pages/Designer/Sider/AssetController/Animation/AnimationList';

import { animationType } from '@/pages/SidePanel/Animation';

import AnimationImport from '@/pages/Designer/Sider/AssetController/Animation/AnimationImport/list';
import style from './index.modules.less';
import AnimationStay from './AnimationStay';

const { TabPane } = Tabs;
const panelList: {
  type: keyof AeA;
  key: 'in' | 'out' | 'stay';
  title: string;
}[] = [
  // {
  //   key: 'inout',
  //   type: 'o&i',
  //   title: '出入场动画',
  // },
  {
    key: 'in',
    type: 'i',
    title: '入场动画',
  },
  {
    key: 'out',
    type: 'o',
    title: '出场动画',
  },
  // {
  //   key: 'stay',
  //   type: 's',
  //   title: '循环动画',
  // },
];
function Animation() {
  const asset = useGetCurrentAsset();
  const { changStatue } = useAniPathEffect();
  const [active, setActive] = useState('in');

  const { value, assetAeaDuration, preview, previewEnd, updatePbr, max } =
    useAssetAeAByObserver();

  function setAnimationPreview(speed = 1) {
    const animationId = value?.[animationType[active]]?.resId;
    if (animationId) {
      preview(animationType[active], animationId, speed);
    }
  }
  // 设置动画速度
  function setAnimationSpeed(pbr: number) {
    updatePbr(animationType[active], pbr);
    previewEnd();
    setAnimationPreview(pbr);
  }

  useEffect(() => {
    if (asset?.attribute?.stayEffect) {
      setActive('s');
    }
  }, [asset?.attribute?.stayEffect]);

  return (
    <div className={style.animationPanel}>
      <Tabs
        destroyInactiveTabPane
        activeKey={active}
        className="xdd-designer-sider-tab"
        onChange={v => {
          setActive(v);
          if (v === 'stay' && asset?.attribute?.stayEffect?.graph) {
            changStatue(2);
          } else {
            changStatue(-1);
          }
        }}
      >
        {panelList.map(item => {
          return (
            <TabPane tab={item.title} key={item.key}>
              <div
                className={classNames(
                  style.animationTabItem,
                  style.animationListWhiteFont,
                )}
              >
                <AnimationList
                  type={item.key}
                  active={value?.[animationType[active]]?.resId}
                />

                <div
                  hidden={!value?.[animationType[active]]?.resId}
                  className={style.animationTimeBox}
                >
                  <span className={style.timeLabel}>动画时长：</span>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <InputNumber
                      size="small"
                      value={`${
                        assetAeaDuration &&
                        (assetAeaDuration?.[item.type] / 1000).toFixed(1)
                      }s`}
                      style={{ height: 22, width: 50, fontSize: 12 }}
                    />

                    <Slider
                      tooltipVisible={false}
                      step={100}
                      min={100}
                      max={max[item.type]}
                      value={assetAeaDuration?.[item.type]}
                      onChange={time => {
                        const pbr = calcAeATimeToPbr(
                          time,
                          value?.[item.type].kw,
                        );

                        setAnimationSpeed(pbr);
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabPane>
          );
        })}
        <TabPane tab="停留动画" key="s">
          <AnimationStay />
        </TabPane>
        <TabPane tab="上传动画" key="import">
          <AnimationImport />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default observer(Animation);
