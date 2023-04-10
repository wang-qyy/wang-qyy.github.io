import { PropsWithChildren, useEffect, useMemo, useState, useRef } from 'react';
import {
  useGetCurrentAsset,
  useFontEffectByObserver,
  observer,
  effectTextIsLinear,
  effectColorfulIsLinear,
} from '@hc/editor-core';
import classNames from 'classnames';
import { useDebounceFn, useHover } from 'ahooks';

import { cdnHost } from '@/config/urls';
import { getSpecificWordList, getSignatureList } from '@/api/text';
import Skeleton from '@/components/Skeleton';
import { getInitFontAttribute } from '@/utils/assetHandler/assetUtils';
import { handleAddAsset } from '@/utils/assetHandler';
import { clickActionWeblog } from '@/utils/webLog';

import Image from '@/pages/SidePanel/Upload/FileItem/Image';

import './index.less';
import DragBox from '@/components/DragBox';

function Item({ src, onClick, className, data, type, clickType }: any) {
  const { updateFontEffect, updateSignatureFontEffect } =
    useFontEffectByObserver();
  const dragAsset = useMemo(() => {
    if (!data || clickType == 'update') {
      return {};
    }
    if (type === 'effect') {
      // 特效字
      return {
        meta: { type: 'text', addOrigin: 'specificWord' },
        attribute: {
          effect: `${data.id}@0`,
          ...getInitFontAttribute('effect'),
          rt_preview_url: `${cdnHost}${data.preview?.split('.')[0]}-big.png`,
        },
        weblogType: type,
      };
    }
    return {
      meta: { type: 'text', addOrigin: 'specificWord' },
      attribute: {
        ...getInitFontAttribute('effect'),
        rt_preview_url: data.preview_url,
        effectColorful: {
          resId: data.id,
          effect: '',
        },
      },
      weblogType: type,
    };
  }, [data]);
  // 选中特效字
  const handleSpecificWordClick = () => {
    clickActionWeblog(`action_text_add_effect`, { asset_id: data.id });

    if (clickType === 'update') {
      updateFontEffect(`${data.id}@0`);
    } else {
      handleAddAsset({
        meta: { type: 'text', addOrigin: 'specificWord' },
        attribute: {
          effect: `${data.id}@0`,
          ...getInitFontAttribute('effect'),
        },
      });
    }
  };

  // 选中花字
  function handFlowerTextClick() {
    clickActionWeblog(`action_text_add_specificWord`, { asset_id: data.id });
    if (clickType === 'add') {
      handleAddAsset(dragAsset);
    } else {
      updateSignatureFontEffect({
        resId: data.id,
        effect: undefined,
      });
    }
  }
  const { run: clickItem } = useDebounceFn(
    () => {
      if (onClick) {
        onClick();
      } else {
        if (type === 'effect') {
          // 特效字
          handleSpecificWordClick();
        } else {
          // 花字
          handFlowerTextClick();
        }
      }
    },
    {
      wait: 300,
    },
  );

  const itemRef = useRef<HTMLDivElement>(null);
  const isHover = useHover(itemRef);
  const timer = useRef();

  useEffect(() => {
    if (isHover) {
      timer.current = setTimeout(() => {
        clickActionWeblog(`asset_hover_text`, {
          action_label:
            type === 'effect' ? 'text_effect' : 'text_effectColorful',
          asset_id: data.id,
        });
      }, 2000);
    } else {
      clearTimeout(timer.current);
    }
  }, [isHover]);

  return (
    <>
      {data && clickType == 'add' ? (
        <DragBox data={dragAsset} type="text">
          <div
            ref={itemRef}
            className={classNames('specific-word-item', className)}
            onClick={clickItem}
          >
            <Image poster={src} />
          </div>
        </DragBox>
      ) : (
        <div
          ref={itemRef}
          className={classNames('specific-word-item', className, 'no-drag')}
          onClick={clickItem}
        >
          <Image poster={src} />
        </div>
      )}
    </>
  );
}

const TextList = ({
  clickType = 'add',
  active = false,
}: PropsWithChildren<{
  clickType?: 'add' | 'update';
  active?: boolean;
}>) => {
  // 获取文字配置
  const asset = useGetCurrentAsset();
  const [loading, setLoading] = useState(true);

  const { clearFontEffect } = useFontEffectByObserver();

  const [specificWordList, setSpecificWordList] = useState<
    {
      id: string;
      name: string;
      preview: string;
    }[]
  >([]);

  // 花字
  const [signatureList, setSignatureList] = useState<
    {
      id: string;
      name: string;
      preset_url: string;
      preview_url: string;
    }[]
  >([]);

  async function getTextList() {
    setLoading(true);
    const res = await Promise.all([getSpecificWordList(), getSignatureList()]);
    setSpecificWordList(res[0].msg);
    setSignatureList(res[1].data.items);
    setLoading(false);
  }
  useEffect(() => {
    getTextList();
  }, []);
  const { signature, specificWord } = useMemo(() => {
    let specificWord = specificWordList;
    let signature = signatureList;
    if (asset?.isAeaText) {
      specificWord = specificWordList.filter(item => {
        return !effectTextIsLinear(item.id);
      });
      signature = signatureList.filter(item => {
        return !effectColorfulIsLinear(item.id);
      });
    }

    return {
      signature,
      specificWord,
    };
  }, [asset?.isAeaText, specificWordList, signatureList]);
  return (
    <Skeleton
      loading={loading}
      rows={3}
      columns={3}
      // className="specific-word-skeleton"
    >
      <div className="specific-word-list">
        {/* {clickType === 'update' && (
          <Item
            onClick={clearFontEffect}
            className={classNames({
              'specific-word-active':
                !asset?.attribute.effect && !asset?.attribute.effectColorful,
            })}
            src={`${cdnHost}/specificWordPreview/-1.png`}
          />
        )} */}
        {/* 花字 */}
        {signature.map((item: any) => (
          <Item
            key={`signature-${item.id}`}
            className={
              active && asset?.attribute.effectColorful?.resId === item.id
                ? 'specific-word-active'
                : ''
            }
            src={item.preview_url}
            data={item}
            type="specificWord"
            clickType={clickType}
          />
        ))}
        {/* 特效字 */}
        {specificWord.map((item: any) => (
          <Item
            key={`specific-word-${item.id}`}
            className={classNames({
              'specific-word-active':
                active && asset?.attribute?.effect?.split('@')[0] === item.id,
            })}
            src={`${cdnHost}${item.preview?.split('.')[0]}-big.png`}
            data={item}
            type="effect"
            clickType={clickType}
          />
        ))}
      </div>
    </Skeleton>
  );
};

export default observer(TextList);
