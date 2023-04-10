import React, { useState } from 'react';
import { Popover, Tabs } from 'antd';
import { gradientMock } from '@/pages/SidePanel/TextColor/ColorSelector/ColorSelector';
import { monochrome } from '@/pages/SidePanel/TextColor/ColorSelector/index';
import ColorPickup from '@/components/ColorPickup';
import ColorSetModal from '@/components/ColorSetModal';
import { RGBA, GradientType } from '@kernel/typing';
import classNames from 'classnames';
import { TooltipPlacement } from 'antd/lib/tooltip';
import styles from './index.less';

const { TabPane } = Tabs;

function ColorPopover(props: {
  children: any;
  color: any;
  isDesigner: boolean; // 是否设计师编辑器 用于显示不同css
  changeMockGradient: (val: string) => void; // 渐变色设置
  gradientColorChange: (val: any) => void; // 弹框渐变色设置
  colorPickupChange: (color: RGBA | GradientType) => void; // 弹框纯色设置
  placement: any; // 弹框位置
}) {
  const {
    children,
    color,
    gradientColorChange,
    colorPickupChange,
    changeMockGradient,
    isDesigner,
    placement = 'bottomRight',
  } = props;
  const [visible, _visible] = useState(false);
  // color:纯色 gradient：渐变
  const [type, setType] = useState('color');

  return (
    <>
      <Popover
        visible={visible}
        trigger="click"
        overlayClassName="colorPopover"
        onVisibleChange={visible => {
          _visible(visible);
        }}
        placement={placement}
        // getTooltipContainer={trigger => trigger}
        destroyTooltipOnHide
        content={
          <div
            className={classNames(styles.colorPopover, {
              [styles.designerColorPopover]: isDesigner,
            })}
          >
            <Tabs
              tabBarExtraContent={
                <Popover
                  trigger="click"
                  placement="bottomRight"
                  destroyTooltipOnHide
                  overlayClassName={styles['color-picker']}
                  content={
                    gradientColorChange ? (
                      <ColorSetModal
                        color={color || ''}
                        gradientColorChange={val => {
                          gradientColorChange(val);
                        }}
                        colorPickupChange={val => {
                          colorPickupChange(val?.rgb);
                        }}
                        type={type}
                        setType={setType}
                      />
                    ) : (
                      <div style={{ padding: '10px' }}>
                        <ColorPickup
                          color={color || ''}
                          onChange={(val: { rgb: RGBA }) => {
                            colorPickupChange(val.rgb);
                          }}
                        />
                      </div>
                    )
                  }
                >
                  <div className={styles.colorPopoverRight}>自定义颜色</div>
                </Popover>
              }
            >
              <TabPane tab="预设纯色" key="1">
                <div className={styles.colorWarp}>
                  {monochrome.map(item => (
                    <div
                      className={styles.colorWarpItem}
                      style={{ background: item }}
                      key={item}
                      onClick={e => {
                        const rgb = item.replace(/[^\d,]/g, '').split(',');
                        const tempColor = {
                          r: Number(rgb[0]),
                          g: Number(rgb[1]),
                          b: Number(rgb[2]),
                          a: 1,
                        };
                        colorPickupChange(tempColor);
                      }}
                    />
                  ))}
                </div>
              </TabPane>
              {changeMockGradient && (
                <TabPane tab="预设渐变" key="2">
                  <div className={styles.colorWarp}>
                    {gradientMock.map(item => (
                      <div
                        className={styles.colorWarpItem}
                        key={item}
                        style={{ backgroundImage: item }}
                        onClick={e => {
                          changeMockGradient(item);
                        }}
                      />
                    ))}
                  </div>
                </TabPane>
              )}
            </Tabs>
          </div>
        }
      >
        <div
          onClick={() => {
            _visible(true);
          }}
        >
          {children}
        </div>
      </Popover>
    </>
  );
}

export default ColorPopover;
