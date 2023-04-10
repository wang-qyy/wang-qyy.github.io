/* eslint-disable no-nested-ternary */
import { ReactElement, useEffect } from 'react';
import { useSetState } from 'ahooks';
import { Popover } from 'antd';
import classNames from 'classnames';

import {
  useFontEffectByObserver,
  useFontColorByObserver,
  useSetTemplateBackgroundColorByObserver,
  observer,
  RGBA,
  toJS,
  useSvgPathFill,
} from '@hc/editor-core';

import EffectMachine from '@/pages/Designer/Sider/Text/TextTabs/Basic/components/EffectMachine';

import SidePanelWrap from '@/components/SidePanelWrap';

import ColorPickup from '@/components/ColorPickup';

import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';

import SvgColor from '@/pages/TopToolBar/SvgColor';
import SvgPathColor from '@/pages/TopToolBar/SvgPathColor';

import BackColor from '@/pages/TopToolBar/BackColor';
import { useUserInfo } from '@/store/adapter/useUserInfo';

import { cdnHost } from '@/config/urls';

import { stopPropagation } from '@/utils/single';

import ColorSelector from './ColorSelector';

import BrandColor from './BrandColor';

import './index.less';

const TextColor = () => {
  const [fontColor, updateFontColor] = useFontColorByObserver();
  const { update } = useSetTemplateBackgroundColorByObserver();
  const { fill, updateFill } = useSvgPathFill();
  const userInfo = useUserInfo();

  const {
    batchUpdateLayerColor,
    updateLayerColor,
    updateColorMatch,
    value: asset,
  } = useFontEffectByObserver();
  const { effect, effectVariant, effectColorful } = asset;
  const container = document.querySelector('.xiudodo-main') as HTMLDivElement;

  const {
    value: { panelKey },
    close: closeSettingPanel,
  } = useSettingPanelInfo();

  // rt_variantList 常见颜色

  const [state, setState] = useSetState({
    colorPopover: false,
    popover: false,
    colorPickerSelected: {},
    activeIndex: -1,
  });

  const { popover } = state;

  // 打开拾色器
  const openSketchPicker = (rgba: RGBA, index?: number) => {
    setState({
      colorPickerSelected: rgba,
      colorPopover: true,
      activeIndex: index,
    });
  };

  const changedColor = (rgba: RGBA) => {
    setState({ colorPickerSelected: rgba });
    if (!state.activeIndex && state.activeIndex !== 0) {
      updateFontColor(rgba);
    } else if (state.activeIndex > -1) {
      updateLayerColor(state.activeIndex, rgba);
    }
  };

  // 自定义预设颜色
  const getColorSelectType: Function = () => {
    let type = {};

    // 背景颜色
    if (panelKey === 'tool-template_background_color') {
      type = {
        grid: 7,
        divide: 4, // 背景颜色设置
      };
      return type;
    }

    // svg-path
    if (panelKey === 'tool-svg-path-color') {
      type = {
        grid: 7,
        divide: 5,
        onselect: (colors: Array<RGBA>) => {
          // console.log('colors', colors);
        },
      };
      return type;
    }

    // svg
    if (panelKey === 'tool-svg-color') {
      type = {
        grid: 7,
        divide: 3,
        onselect: (colors: Array<RGBA>) => updateFontColor(colors[0]),
      };
      return type;
    }
    if (!effect) {
      type = {
        grid: 7,
        divide: 1,
        onselect: (colors: Array<RGBA>) => updateFontColor(colors[0]),
      };
    } else if (!effectVariant?.rt_variantList?.length) {
      const len = effectVariant?.variableColorPara?.length;
      if (len === 1) {
        type = {
          grid: 6,
          divide: 1,
          onselect: batchUpdateLayerColor,
        };
      } else if (len === 2) {
        type = {
          grid: 4,
          divide: 2,
          onselect: batchUpdateLayerColor,
        };
      }
    }

    return type;
  };

  // {/* 纯文本可修改颜色 */}
  const renderTextVariableColor = (
    <div
      className="color-block"
      style={{
        backgroundColor: `rgba(${fontColor?.r},${fontColor?.g},${fontColor?.b},${fontColor?.a})`,
      }}
      onClick={() => {
        openSketchPicker({ ...fontColor });
      }}
    />
  );

  // 可修改颜色
  const renderVariableColorPara = () => {
    return effectVariant.variableColorPara.map(
      (item: { colorBlock: RGBA }, index: number) => {
        const color = item.colorBlock;
        return (
          <div
            key={`colorBlock-${index}`}
            className={classNames('color-block')}
            style={{
              backgroundColor: `rgba(${color.r},${color.g},${color.b},${color.a})`,
              border: '1px solid #ededed',
              borderRadius: 2,
              flex: '0 0 63px',
            }}
            onClick={e => {
              stopPropagation(e);
              openSketchPicker(color, index);
            }}
          />
        );
      },
    );
  };

  // img
  const renderImg = () => {
    let backgroundURL = '';
    effectVariant?.layers.forEach((item: { backgroundURL: string }) => {
      if (item.backgroundURL) {
        backgroundURL = item.backgroundURL;
      }
    });

    return (
      <div
        className="color-block"
        style={{
          background: `url(${cdnHost}${backgroundURL})`,
        }}
      />
    );
  };
  // 判断是否有图片
  const hasImg = effectVariant?.layers?.some(
    (item: { backgroundURL: string }) => item.backgroundURL,
  );
  const renderVariableColor = () => {
    // 普通文字
    if (!effect && !effectVariant) {
      return renderTextVariableColor;
    }
    if (effectVariant?.variableColorPara?.length > 0) {
      return renderVariableColorPara();
    }

    // 图片背景
    if (hasImg) {
      return renderImg();
    }
    let colorDom: ReactElement = <div />;
    if (effectVariant?.rt_variantColors) {
      effectVariant?.rt_variantColors.forEach((color: RGBA, index: number) => {
        if (effect.split('@')[1] == index) {
          colorDom = (
            <div
              key={`colorBlock-${index}`}
              className="color-block"
              style={{
                backgroundColor: `rgba(${color.r},${color.g},${color.b},${color.a})`,
                border: '1px solid #ededed',
                borderRadius: 2,
                flex: '0 0 63px',
              }}
            />
          );
        }
      });
    }

    return colorDom;
  };

  useEffect(() => {
    container.addEventListener('mouseup', () => {
      setState({
        colorPopover: false,
        popover: false,
      });
    });
    return () => {
      container.removeEventListener('mouseup', () => {
        setState({
          colorPopover: false,
          popover: false,
        });
      });
    };
  }, [container]);

  const getColorPopover = () => {
    switch (panelKey) {
      case 'tool-svg-color':
        return (
          <SvgColor
            setPopover={bol => {
              setState({
                popover: bol,
              });
            }}
            popover={popover}
          />
        );
      case 'tool-svg-path-color':
        return (
          <SvgPathColor
            setPopover={bol => {
              setState({
                popover: bol,
              });
            }}
            popover={popover}
          />
        );
      case 'tool-template_background_color':
        return (
          <BackColor
            setPopover={bol => {
              setState({
                popover: bol,
              });
            }}
            popover={popover}
          />
        );

      default:
      case '':
        return (
          <Popover
            visible={state.colorPopover}
            trigger="click"
            overlayClassName="color-picker"
            onVisibleChange={visible => {
              // 非预设颜色才能进行修改
              if (effectVariant?.rt_variantColors.length === 0 && !hasImg) {
                setState({ colorPopover: visible });
              }
            }}
            getTooltipContainer={trigger => trigger}
            destroyTooltipOnHide
            content={
              <div style={{ width: '318px', padding: '10px' }}>
                <ColorPickup
                  color={state.colorPickerSelected}
                  onChange={(color: { rgb: {} }) => {
                    changedColor(color.rgb);
                  }}
                />
              </div>
            }
          >
            <div
              className={classNames('text-color', {
                'no-curor':
                  effectVariant?.rt_variantColors.length > 0 || hasImg,
              })}
            >
              {renderVariableColor()}
            </div>
          </Popover>
        );
    }
  };

  return (
    <SidePanelWrap
      header="颜色设置"
      onCancel={closeSettingPanel}
      wrapClassName="text-color-panel-wrap side-setting-panel"
    >
      <div className="box-wrap">
        <div className="box-title">文档颜色</div>
        {effectColorful ? <EffectMachine /> : <>{getColorPopover()}</>}
      </div>

      {/* 花字暂时没有预设颜色 */}
      {!effectColorful && (
        <>
          {/* 品牌色  双色不支持  团队才显示品牌功能 */}
          {getColorSelectType().divide != 2 && userInfo?.team_id > 0 && (
            <BrandColor panelKey={panelKey} />
          )}
          <div className="box-wrap-line" />
          <div
            className="box-wrap"
            style={{ display: 'flex', flexDirection: 'column' }}
            hidden={
              !effectVariant?.rt_variantList?.length &&
              effectVariant?.variableColorPara?.length > 2 &&
              effect
            }
          >
            {effectVariant?.rt_variantList?.length > 0 && (
              <>
                <div className="box-title">预设颜色</div>
                <div className="">
                  {effectVariant?.rt_variantList.map(
                    (item: { layers: [] }, index: number) => {
                      const tempSet = new Set();
                      const len = item.layers.length;

                      item.layers.forEach(
                        (layerItem: {
                          [key: string]: { [key: string]: number };
                        }) => {
                          Object.keys(layerItem).forEach(subItem => {
                            if (
                              ['color', 'strokeColor', 'shadowColor'].indexOf(
                                subItem,
                              ) > -1 &&
                              layerItem[subItem].a > 0
                            ) {
                              const rgba = `rgba(${layerItem[subItem].r},${layerItem[subItem].g},${layerItem[subItem].b},${layerItem[subItem].a})`;
                              tempSet.add(rgba);
                            }
                            if (subItem === 'backgroundURL' && len === 1) {
                              const url = `url(${
                                cdnHost + layerItem[subItem]
                              })`;
                              tempSet.add(url);
                            }
                          });
                        },
                      );

                      const boxItem: Array<ReactElement> = [];

                      if (tempSet.size === 0) {
                        item.layers.forEach(layerItem => {
                          Object.keys(layerItem).forEach(subItem => {
                            if (subItem === 'backgroundURL') {
                              const url = `url(${
                                cdnHost + layerItem[subItem]
                              })`;
                              tempSet.add(url);
                            }
                          });
                        });
                      }

                      if (tempSet.size === 0) {
                        const tempItem = effectVariant?.rt_variantColors[index];
                        boxItem.push(
                          <div
                            className="color-block"
                            style={{
                              background: `rgba(${tempItem.r},${tempItem.g},${tempItem.b},${tempItem.a})`,
                            }}
                          />,
                        );
                      } else {
                        tempSet.forEach(it => {
                          boxItem.push(
                            <div
                              key="tempSet"
                              className="color-block"
                              style={{ background: it }}
                            />,
                          );
                        });
                      }

                      return (
                        <div
                          key={`variantColor-${index}`}
                          className="color-block-wrap margin-bottom-8"
                          onClick={() => {
                            updateColorMatch(index);
                          }}
                        >
                          {boxItem}
                        </div>
                      );
                    },
                  )}
                </div>
              </>
            )}
            {/* 自定义推荐颜色 目前仅支持单色和双色 */}
            {((!effectVariant?.rt_variantList?.length &&
              effectVariant?.variableColorPara.length < 3) ||
              !effect) && (
              <ColorSelector
                grid={getColorSelectType().grid}
                divide={getColorSelectType().divide}
                onSelect={color => {
                  const { onselect } = getColorSelectType();
                  if (onselect) {
                    onselect(color);
                  }
                }}
              />
            )}
          </div>
        </>
      )}
    </SidePanelWrap>
  );
};

export default observer(TextColor);
