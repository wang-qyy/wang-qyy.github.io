import { ReactElement, useMemo } from 'react';
import { Popover } from 'antd';
import { useSetState } from 'ahooks';
import {
  AssetClass,
  RGBA,
  useFontEffectByObserver,
  useFontColorByObserver,
  observer,
} from '@hc/editor-core';
import ColorPopover from '@/components/ColorPopover';

import { cdnHost } from '@/config/urls';
import { stopPropagation } from '@/utils/single';

import './index.less';

interface TextColorProps {
  asset: AssetClass;
}

/**
 * 推荐颜色
 * */
const RecommendColors = observer(({ asset }: { asset: AssetClass }) => {
  const { effectVariant } = asset?.attribute;

  const { batchUpdateLayerColor, updateLayerColor, updateColorMatch, value } =
    useFontEffectByObserver();

  return (
    <div style={{ width: 270, padding: 16 }}>
      {effectVariant?.rt_variantList?.map(
        (item: { layers: [] }, index: number) => {
          const tempSet = new Set();
          const len = item.layers.length;

          item.layers.forEach(
            (layerItem: { [key: string]: { [key: string]: number } }) => {
              Object.keys(layerItem).forEach(subItem => {
                if (
                  ['color', 'strokeColor', 'shadowColor'].indexOf(subItem) >
                  -1 &&
                  layerItem[subItem].a > 0
                ) {
                  const rgba = `rgba(${layerItem[subItem].r},${layerItem[subItem].g},${layerItem[subItem].b},${layerItem[subItem].a})`;
                  tempSet.add(rgba);
                }
                if (subItem === 'backgroundURL' && len === 1) {
                  const url = `url(${cdnHost + layerItem[subItem]})`;
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
                  const url = `url(${cdnHost + layerItem[subItem]})`;
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
  );
});
/**
 * @description 当前文本颜色
 * */
function TextColor(props: TextColorProps) {
  const { asset } = props;
  const [state, setState] = useSetState({
    colorPopover: false,
    popover: false,
    colorPickerSelected: { r: 0, g: 0, b: 0, a: 1 },
    activeIndex: -1,
  });

  const [fontColor, updateFontColor] = useFontColorByObserver();

  const { batchUpdateLayerColor, updateLayerColor, updateColorMatch, value } =
    useFontEffectByObserver();

  const { effect, effectVariant, effectColorful } = asset.attribute;

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

  // {/* 纯文本可修改颜色 */}
  const renderTextVariableColor = (
    <div
      className="color-block"
      style={{
        backgroundColor: `rgba(${fontColor?.r},${fontColor?.g},${fontColor?.b},${fontColor?.a})`,
      }}
      onClick={e => {
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
            className="color-block"
            style={{
              backgroundColor: `rgba(${color.r},${color.g},${color.b},${color.a})`,
              border: '1px solid #ededed',
              borderRadius: 2,
              flex: '0 0 63px',
            }}
            onClick={e => {
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
        onClick={e => {
          setState({
            colorPopover: true,
          });
        }}
        className="color-block"
        style={{ background: `url(${cdnHost}${backgroundURL})` }}
      />
    );
  };

  const colorType = useMemo(() => {
    if ((!effect && !effectVariant) || effectVariant?.variableColorPara?.length)
      return 'colorPickup';
    return '';
  }, []);

  const renderVariableColor = () => {
    // 普通文字
    if (!effect && !effectVariant) {
      return renderTextVariableColor;
    }

    if (effectVariant?.variableColorPara?.length) {
      return renderVariableColorPara();
    }

    // 图片背景
    if (effectVariant?.layers?.some((item: any) => item.backgroundURL)) {
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

  return (
    <div className="textColor">
      {colorType === 'colorPickup' ? (
        <ColorPopover
          color={state.colorPickerSelected}
          isDesigner
          placement="topRight"
          colorPickupChange={color => {
            changedColor(color);
          }}
        >
          <div className="text-color">{renderVariableColor()}</div>
        </ColorPopover>
      ) : (
        <>
          <Popover
            visible={state.colorPopover}
            onVisibleChange={visible => {
              setState({ colorPopover: visible });
            }}
            trigger="click"
            overlayClassName="color-picker"
            destroyTooltipOnHide
            content={<RecommendColors asset={asset} />}
          />
          <div className="text-color">{renderVariableColor()}</div>
        </>
      )}
    </div>
  );
}

export default observer(TextColor);
