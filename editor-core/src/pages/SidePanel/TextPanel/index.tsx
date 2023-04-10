import { useRef, useEffect, useState } from 'react';
import { Button } from 'antd';

import SidePanelWrap from '@/components/SidePanelWrap';
import TextList from '@/pages/SidePanel/TextSpecialEffects/TextList';
import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';

import {
  getInitFontAttribute,
  TextType,
} from '@/utils/assetHandler/assetUtils';
import { useActiveBrand } from '@/store/adapter/useGlobalStatus';
import { useBrand } from '@/pages/SidePanel/Brand/BrandModal/hook/useBrand';

import { clickActionWeblog } from '@/utils/webLog';
import { handleAddAsset } from '@/utils/assetHandler';
import { useUserFontFamilyByObserver, observer } from '@hc/editor-core';
import { getFontFamily } from '@/utils/fontHandler';

import './index.less';
import DragBox from '@/components/DragBox';
import BrandModal from '@/pages/SidePanel/Brand/BrandModal';

const TextPanel = () => {
  const { activeBrand }: any = useActiveBrand();
  const { bindFontDetail } = useBrand();
  const [fontDetail, _fontDetail]: any = useState(); // 品牌字体

  /**
   * 组织添加文本的数据
   * @param type
   * @returns
   */
  const getTextAsset = (type: TextType, fontStyle: any) => {
    const { width, height } = getCanvasInfo();
    const attribute = getInitFontAttribute(type);

    let posY;

    if (type === 'title') {
      posY = 100;
    } else if (type === 'textBackground') {
      posY = height - attribute.height - 100;
    } else {
      posY = (height - attribute.height) / 2;
    }
    return {
      meta: { type: 'text', addOrigin: 'text', isUserAdd: true },
      attribute: { ...attribute, ...fontStyle },
      transform: { posX: (width - attribute.width) / 2, posY },
      weblogType: type,
    };
  };
  // 获取显示字体
  const getShowFontFamily = (item: any) => {
    return item?.source_type === 1
      ? `webfont-${item?.fontInfo?.font_id} ,font130`
      : item?.fontInfo?.font_id;
  };

  // 获取asset
  const getAsset = (type: TextType, item: any) => {
    let asset;
    // item不等于空对象为品牌字体添加
    if (item && JSON.stringify(item) != '{}') {
      const { font_size } = item;
      const font = getShowFontFamily(item);
      const fontFamily =
        item?.source_type === 1
          ? {
            resId: `f${item.fontInfo?.font_id}`,
            ufsId: `f${item.id}`,
            fontFamily: `webfont-${item.fontInfo?.font_id}`,
            fontSize: font_size,
          }
          : { fontFamily: getFontFamily(font), fontSize: font_size };
      asset = getTextAsset(type, fontFamily);
    } else {
      asset = getTextAsset(type, {});
    }
    return asset;
  };
  const addText = (type: TextType, item: any) => {
    clickActionWeblog(`action_text_add_${type}`);
    handleAddAsset(getAsset(type, item));
  };

  const timer = useRef();

  function onMouseEnter(type: string) {
    timer.current = setTimeout(() => {
      clickActionWeblog(`asset_hover_text`, {
        action_label: type,
      });
    }, 2000);
  }

  function onMouseLeave() {
    clearTimeout(timer.current);
  }

  // 获取品牌字体
  const updateFontDetail = () => {
    bindFontDetail((data: any) => {
      _fontDetail(data.info);
    });
  };
  useEffect(() => {
    updateFontDetail();
  }, [activeBrand?.id]);

  return (
    <SidePanelWrap wrapClassName="text-panel-wrap">
      <div className="text-panel-content">
        <div className="text-panel-header">
          <div className="text-panel-header-desc">
            {true ? (
              <BrandModal updateFontCallBack={updateFontDetail} />
            ) : (
              '点击要添加到页面的文本'
            )}
          </div>
          {/* <div>基础文字</div> */}
          <DragBox
            data={getTextAsset(
              'title',
              getAsset('title', fontDetail?.title)?.attribute,
            )}
            type="text"
          >
            <Button
              size="large"
              onClick={() => addText('title', fontDetail?.title)}
              onMouseEnter={() => onMouseEnter('text_h')}
              onMouseLeave={onMouseLeave}
              style={{
                fontFamily: getShowFontFamily(fontDetail?.title),
                fontSize: '22px',
                height: '42px',
                padding: '0px',
              }}
            >
              添加标题字
            </Button>
          </DragBox>
          <DragBox
            data={getTextAsset(
              'text',
              getAsset('text', fontDetail?.subtitle)?.attribute,
            )}
            type="text"
          >
            <Button
              size="large"
              onClick={() => addText('text', fontDetail?.subtitle)}
              onMouseEnter={() => onMouseEnter('text_p')}
              onMouseLeave={onMouseLeave}
              style={{
                fontFamily: getShowFontFamily(fontDetail?.subtitle),
                fontSize: '18px',
                height: '42px',
                padding: '0px',
              }}
            >
              添加正文
            </Button>
          </DragBox>
          <DragBox
            data={getTextAsset(
              'textBackground',
              getAsset('textBackground', fontDetail?.content)?.attribute,
            )}
            type="text"
          >
            <div className="backgroundButton">
              <Button
                size="large"
                onClick={() => addText('textBackground', fontDetail?.content)}
                onMouseEnter={() => onMouseEnter('text_b')}
                onMouseLeave={onMouseLeave}
                style={{
                  background: 'rgba(38, 46, 72, 0.08)',
                  fontFamily: getShowFontFamily(fontDetail?.content),
                  fontSize: '12px',
                }}
              >
                添加带底色字体
              </Button>
            </div>
          </DragBox>
        </div>
        <TextList />
      </div>
    </SidePanelWrap>
  );
};

export default observer(TextPanel);
