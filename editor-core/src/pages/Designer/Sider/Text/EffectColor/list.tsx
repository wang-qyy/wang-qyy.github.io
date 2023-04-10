import { PropsWithChildren } from 'react';
import {
  useGetCurrentAsset,
  useFontEffectByObserver,
  observer,
} from '@hc/editor-core';
import { getSignatureList, getSpecificWordList } from '@/api/text';
import { useRequest } from 'ahooks';
import { XiuIcon } from '@/components';
import { cdnHost } from '@/config/urls';
import { getInitFontAttribute } from '@/utils/assetHandler/assetUtils';
import { handleAddAsset } from '@/utils/assetHandler';

import TextItem from '../Item';

interface EffectColorProps {
  icon?: any;
  type: 'add' | 'update';
  onHandleClick: (type: string, id?: string | undefined) => void;
}

const EffectColorList = (props: PropsWithChildren<EffectColorProps>) => {
  const { type } = props;
  const currentAsset = useGetCurrentAsset();
  const attribute = currentAsset?.attribute;
  const { loading, data } = useRequest(getSignatureList);
  const { loading: specialDataLoad, data: specialData } =
    useRequest(getSpecificWordList);

  const wordList = data?.items || [];
  const specialList = specialData?.msg || [];
  const { updateFontEffect, updateSignatureFontEffect, clearFontEffect } =
    useFontEffectByObserver();

  // 选中特效字
  const handleSpecificWordClick = (id: number) => {
    if (type === 'update') {
      updateFontEffect(`${id}@0`);
    } else {
      handleAddAsset({
        meta: { type: 'text', addOrigin: 'specificWord' },
        attribute: {
          effect: `${id}@0`,
          ...getInitFontAttribute('effect'),
        },
      });
    }
  };

  // 选中花字
  const handleEffectClick = (id: string) => {
    if (type === 'update') {
      updateSignatureFontEffect({ resId: id, effect: undefined });
    } else {
      handleAddAsset({
        meta: { type: 'text', addOrigin: 'specificWord' },
        attribute: {
          ...getInitFontAttribute('effect'),
          effectColorful: { resId: id, effect: undefined },
        },
      });
    }
  };

  return (
    <>
      {type === 'update' && (
        <TextItem
          type="effect"
          name={
            <XiuIcon
              type="iconwushuju"
              style={{ fontSize: 36, color: '#fff' }}
            />
          }
          onClick={clearFontEffect}
          attribute={{}}
        />
      )}

      {/* 花字 */}
      {(!currentAsset?.attribute?.textBackground ||
        !currentAsset?.attribute?.textBackground.enabled) &&
        wordList.map(item => {
          return (
            <TextItem
              type="effect"
              key={item.id}
              active={attribute?.effectColorful?.resId === item.id}
              src={item.preview_url}
              onClick={() => handleEffectClick(item.id)}
              attribute={{
                rt_preview_url: item.preview_url,
                effectColorful: { resId: item.id, effect: '' },
              }}
            />
          );
        })}
      {/* 特效字 */}
      {specialList.map(item => {
        const src = `${cdnHost}${item.preview?.split('.')[0]}-big.png`;

        return (
          <TextItem
            key={item.id}
            type="effect"
            active={attribute?.effectColorful?.resId === item.id}
            src={src}
            onClick={() => handleSpecificWordClick(item.id)}
            attribute={{
              effect: item.id,
              rt_preview_url: src,
            }}
          />
        );
      })}
    </>
  );
};
export default observer(EffectColorList);
